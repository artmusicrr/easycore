// ================================
// GET /api/financial/payment-plans/[treatmentId]
// Buscar plano e parcelas
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { treatmentId: string } }
) {
  try {
    const { treatmentId } = params;

    const plan = await prisma.paymentPlan.findUnique({
      where: { treatment_id: treatmentId },
      include: {
        installments: {
          orderBy: { numero_parcela: 'asc' },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado para este tratamento' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);

  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    const protocol = Math.floor(10000 + Math.random() * 90000);
    return NextResponse.json(
      { error: 'Erro interno do servidor', protocol },
      { status: 500 }
    );
  }
}
