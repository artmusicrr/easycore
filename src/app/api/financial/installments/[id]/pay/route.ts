// ================================
// POST /api/financial/installments/[id]/pay
// Registrar pagamento de parcela
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { processInstallmentPayment, updateTreatmentTotalPaid } from '@/lib/payments';
import { updateTreatmentRisk } from '@/lib/risk';

const payInstallmentSchema = z.object({
  valor_pago: z.number().min(0, 'Valor não pode ser negativo'),
  forma_pagamento: z.enum([
    'PIX',
    'cartao_credito',
    'cartao_debito',
    'dinheiro',
    'boleto',
    'transferencia',
  ]),
  comprovante_url: z.string().url().optional(),
  observacao: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = params;
    const body = await request.json();
    
    const validation = payInstallmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const payment = await processInstallmentPayment({
      installment_id: id,
      valor_pago: validation.data.valor_pago,
      forma_pagamento: validation.data.forma_pagamento,
      recebido_por_id: userId!,
      comprovante_url: validation.data.comprovante_url,
      observacao: validation.data.observacao,
    });

    // Atualizar tratamento e risco
    await updateTreatmentTotalPaid(payment.treatment_id);
    await updateTreatmentRisk(payment.treatment_id);

    await createAuditLog({
      userId: userId!,
      acao: AUDIT_ACTIONS.PAYMENT_CREATED,
      detalhes: {
        payment_id: payment.id,
        installment_id: id,
        valor_pago: validation.data.valor_pago,
      },
    });

    if (validation.data.valor_pago === 0) {
      await createAuditLog({
        userId: userId!,
        acao: AUDIT_ACTIONS.TREATMENT_UPDATED,
        detalhes: {
          action: 'ZERO_PAYMENT_REGISTERED',
          installment_id: id,
        },
      });
    }

    return NextResponse.json(payment, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao registrar pagamento de parcela:', error);
    const protocol = Math.floor(10000 + Math.random() * 90000);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor', protocol },
      { status: 500 }
    );
  }
}
