// ================================
// POST /api/financial/payment-plans
// Criar plano de parcelamento
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { createPaymentPlan } from '@/lib/payments';

const createPlanSchema = z.object({
  treatment_id: z.string().uuid('ID do tratamento inválido'),
  total_parcelas: z.number().int().min(1).max(24, 'Máximo de 24 parcelas'),
  data_inicio: z.string().datetime(),
  dia_vencimento: z.number().int().min(1).max(28, 'Dia de vencimento deve ser entre 1 e 28'),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    
    const validation = createPlanSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { treatment_id, total_parcelas, data_inicio, dia_vencimento } = validation.data;

    // Verificar se já existe um plano
    const existingPlan = await prisma.paymentPlan.findUnique({
      where: { treatment_id },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Tratamento já possui um plano de parcelamento' },
        { status: 400 }
      );
    }

    const plan = await createPaymentPlan({
      treatment_id,
      total_parcelas,
      data_inicio: new Date(data_inicio),
      dia_vencimento,
    });

    await createAuditLog({
      userId: userId!,
      acao: AUDIT_ACTIONS.TREATMENT_UPDATED, // Usando uma ação genérica ou criaremos uma nova
      detalhes: {
        action: 'PAYMENT_PLAN_CREATED',
        treatment_id,
        plan_id: plan.id,
        total_parcelas,
      },
    });

    return NextResponse.json(plan, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar plano de pagamento:', error);
    const protocol = Math.floor(10000 + Math.random() * 90000);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor', protocol },
      { status: 500 }
    );
  }
}
