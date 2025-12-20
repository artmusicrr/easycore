// ================================
// GET /api/dashboard/stats
// Estatísticas do Dashboard
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        // TODO: Adicionar verificação de autenticação quando o middleware estiver configurado
        // if (!userId) { ... }

        // 1. Pacientes Ativos: Pacientes com pelo menos um tratamento "aberto"
        const activePatientsCount = await prisma.patient.count({
            where: {
                treatments: {
                    some: {
                        status: 'aberto'
                    }
                }
            }
        });

        // 2. Tratamentos Abertos: Total de tratamentos com status "aberto"
        const openTreatmentsCount = await prisma.treatment.count({
            where: {
                status: 'aberto'
            }
        });

        // 3. Receita Mensal (Mês Atual)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyRevenue = await prisma.payment.aggregate({
            _sum: {
                valor_pago: true
            },
            where: {
                data: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth
                }
            }
        });

        return NextResponse.json({
            activePatients: activePatientsCount,
            openTreatments: openTreatmentsCount,
            monthlyRevenue: monthlyRevenue._sum.valor_pago || 0
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500, headers: corsHeaders }
        );
    }
}
