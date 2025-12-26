// ================================
// GET /api/admin/financial/overview
// Visão administrativa financeira
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateOverdueInstallments } from '@/lib/payments';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Atualizar status
    await updateOverdueInstallments();

    // 1. Total em atraso
    const overdueTotal = await prisma.installment.aggregate({
      where: { status: 'atrasada' },
      _sum: {
        valor_esperado: true,
        valor_pago: true,
      },
    });

    const totalAtrasado = Number(overdueTotal._sum.valor_esperado || 0) - Number(overdueTotal._sum.valor_pago || 0);

    // 2. Pacientes inadimplentes (com parcelas atrasadas)
    const badPayers = await prisma.treatment.findMany({
      where: {
        payment_plan: {
          installments: {
            some: { status: 'atrasada' },
          },
        },
      },
      select: {
        id: true,
        risco_inadimplencia: true,
        patient: {
          select: { nome: true },
        },
        payment_plan: {
          select: {
            installments: {
              where: { status: 'atrasada' },
              select: { valor_esperado: true, valor_pago: true },
            },
          },
        },
      },
      orderBy: { risco_inadimplencia: 'desc' },
      take: 10,
    });

    const formattedBadPayers = badPayers.map(b => {
      const debt = b.payment_plan?.installments.reduce((acc, curr) => 
        acc + (Number(curr.valor_esperado) - Number(curr.valor_pago)), 0) || 0;
      
      return {
        treatment_id: b.id,
        paciente: b.patient.nome,
        risco: b.risco_inadimplencia,
        divida: debt,
      };
    });

    // 3. Resumo por período (últimos 6 meses de pagamentos)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const paymentsHistory = await prisma.payment.findMany({
      where: { data: { gte: sixMonthsAgo } },
      select: { valor_pago: true, data: true },
    });

    return NextResponse.json({
      total_em_atraso: totalAtrasado,
      pacientes_risco: formattedBadPayers,
      resumo_historia: paymentsHistory.length, // Placeholder for more detailed stats
    });

  } catch (error) {
    console.error('Erro na visão administrativa:', error);
    const protocol = Math.floor(10000 + Math.random() * 90000);
    return NextResponse.json(
      { error: 'Erro interno do servidor', protocol },
      { status: 500 }
    );
  }
}
