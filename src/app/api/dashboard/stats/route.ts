// ================================
// GET /api/dashboard/stats
// Estatísticas do Dashboard
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('[Dashboard API] Iniciando busca de estatísticas...');
        
        // 1. Pacientes Ativos: Pacientes com pelo menos um tratamento "aberto"
        const activePatientsCount = await prisma.patient.count({
            where: {
                treatments: { some: { status: 'aberto' } }
            }
        });
        console.log('[Dashboard API] Pacientes ativos:', activePatientsCount);

        // 2. Tratamentos Abertos: Total de tratamentos com status "aberto"
        const openTreatmentsCount = await prisma.treatment.count({
            where: { status: 'aberto' }
        });
        console.log('[Dashboard API] Tratamentos abertos:', openTreatmentsCount);

        // 3. Receita Mensal (Mês Atual)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentMonthRevenue = await prisma.payment.aggregate({
            _sum: { valor_pago: true },
            where: { data: { gte: firstDayOfMonth, lte: lastDayOfMonth } }
        });
        console.log('[Dashboard API] Receita mensal:', currentMonthRevenue._sum.valor_pago);

        // 4. Índice de Risco Médio (Tratamentos Abertos/Atrasados)
        const treatmentsWithRisk = await prisma.treatment.aggregate({
            _avg: { risco_inadimplencia: true },
            where: { status: { in: ['aberto', 'atrasado'] } }
        });
        console.log('[Dashboard API] Risco médio:', treatmentsWithRisk._avg.risco_inadimplencia);

        // 5. Dados do Gráfico (Últimos 5 meses)
        const chartData = [];
        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthRevenue = await prisma.payment.aggregate({
                _sum: { valor_pago: true },
                where: { data: { gte: start, lte: end } }
            });

            const monthTreatmentsCount = await prisma.treatment.count({
                where: { created_at: { gte: start, lte: end } }
            });

            chartData.push({
                name: start.toLocaleString('pt-BR', { month: 'short' }),
                receita: Number(monthRevenue._sum.valor_pago || 0),
                atendimentos: monthTreatmentsCount
            });
        }
        console.log('[Dashboard API] ChartData gerado:', chartData);

        // 6. Tratamentos Recentes
        const recentTreatmentsRaw = await prisma.treatment.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                patient: { select: { nome: true } }
            }
        });

        const recentTreatments = recentTreatmentsRaw.map(t => ({
            id: t.id,
            patient: t.patient.nome,
            treatment: t.descricao,
            status: t.status,
            risk: t.risco_inadimplencia && t.risco_inadimplencia > 75 ? 'critico' : t.risco_inadimplencia && t.risco_inadimplencia > 40 ? 'medio' : 'baixo',
            value: Number(t.valor_total)
        }));
        console.log('[Dashboard API] RecentTreatments gerado:', recentTreatments.length, 'tratamentos');

        // 7. Dados de Inadimplência Geral
        const overdueInstallments = await prisma.installment.aggregate({
            _count: true,
            _sum: { valor_esperado: true },
            where: { status: 'atrasada' }
        });

        const caloteInstallments = await prisma.installment.count({
            where: { status: 'atrasada', is_calote: true }
        });

        // 8. Inadimplência por Mês (últimos 5 meses)
        const overdueByMonth = [];
        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthOverdue = await prisma.installment.aggregate({
                _count: true,
                _sum: { valor_esperado: true },
                where: {
                    status: 'atrasada',
                    data_vencimento: { gte: start, lte: end }
                }
            });

            overdueByMonth.push({
                name: start.toLocaleString('pt-BR', { month: 'short' }),
                quantidade: monthOverdue._count,
                valor: Number(monthOverdue._sum.valor_esperado || 0)
            });
        }

        const response = {
            activePatients: activePatientsCount,
            openTreatments: openTreatmentsCount,
            monthlyRevenue: Number(currentMonthRevenue._sum.valor_pago || 0),
            riskIndex: (treatmentsWithRisk._avg.risco_inadimplencia || 0),
            chartData,
            recentTreatments,
            overdue: {
                total: overdueInstallments._count,
                value: Number(overdueInstallments._sum.valor_esperado || 0),
                calote: caloteInstallments
            },
            overdueByMonth
        };
        
        console.log('[Dashboard API] Resposta final:', JSON.stringify(response, null, 2));
        
        return NextResponse.json(response);

    } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
