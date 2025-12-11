// ================================
// GET /api/payments/[treatmentId]
// Listar pagamentos de um tratamento
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTreatmentBalance } from '@/lib/payments';

export async function GET(
  request: NextRequest,
  { params }: { params: { treatmentId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const { treatmentId } = params;
    
    // Verificar se tratamento existe
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: {
        id: true,
        dentista_id: true,
        valor_total: true,
        valor_pago_total: true,
        status: true,
      },
    });
    
    if (!treatment) {
      return NextResponse.json(
        { error: 'Tratamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar acesso (dentistas só veem seus próprios tratamentos)
    if (userRole === 'dentista' && treatment.dentista_id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado a este tratamento' },
        { status: 403 }
      );
    }
    
    // Buscar pagamentos
    const payments = await prisma.payment.findMany({
      where: { treatment_id: treatmentId },
      orderBy: { data: 'desc' },
      include: {
        recebido_por: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
    
    // Calcular resumo financeiro
    const balance = await getTreatmentBalance(treatmentId);
    
    // Agrupar por forma de pagamento
    const porFormaPagamento = payments.reduce((acc, payment) => {
      const forma = payment.forma_pagamento;
      if (!acc[forma]) {
        acc[forma] = { quantidade: 0, total: 0 };
      }
      acc[forma].quantidade += 1;
      acc[forma].total += Number(payment.valor_pago);
      return acc;
    }, {} as Record<string, { quantidade: number; total: number }>);
    
    return NextResponse.json({
      treatment: {
        id: treatmentId,
        status: treatment.status,
        ...balance,
      },
      payments,
      resumo: {
        total_pagamentos: payments.length,
        por_forma_pagamento: porFormaPagamento,
      },
    });
    
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    
    const errorProtocol = Math.floor(10000 + Math.random() * 90000);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        protocol: errorProtocol,
      },
      { status: 500 }
    );
  }
}
