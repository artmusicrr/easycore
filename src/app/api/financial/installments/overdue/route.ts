// ================================
// GET /api/financial/installments/overdue
// Listar parcelas atrasadas
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateOverdueInstallments } from '@/lib/payments';

export async function GET(request: NextRequest) {
  try {
    // Atualizar status antes de listar
    await updateOverdueInstallments();

    const installments = await prisma.installment.findMany({
      where: {
        status: 'atrasada',
      },
      include: {
        payment_plan: {
          include: {
            treatment: {
              include: {
                patient: {
                  select: { nome: true },
                },
              },
            },
          },
        },
      },
      orderBy: { data_vencimento: 'asc' },
    });

    return NextResponse.json(installments);

  } catch (error) {
    console.error('Erro ao listar parcelas atrasadas:', error);
    const protocol = Math.floor(10000 + Math.random() * 90000);
    return NextResponse.json(
      { error: 'Erro interno do servidor', protocol },
      { status: 500 }
    );
  }
}
