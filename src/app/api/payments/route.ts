// ================================
// POST /api/payments
// Registrar novo pagamento
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { updateTreatmentTotalPaid } from '@/lib/payments';
import { updateTreatmentRisk } from '@/lib/risk';

// Schema de validação
const createPaymentSchema = z.object({
  treatment_id: z.string().uuid('ID do tratamento inválido'),
  valor_pago: z.number().positive('Valor deve ser positivo'),
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

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    
    // Validar dados
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { treatment_id, valor_pago, forma_pagamento, comprovante_url, observacao } = validation.data;
    
    // Verificar se tratamento existe
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatment_id },
    });
    
    if (!treatment) {
      return NextResponse.json(
        { error: 'Tratamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se tratamento já está pago
    if (treatment.status === 'pago') {
      return NextResponse.json(
        { error: 'Tratamento já está totalmente pago' },
        { status: 400 }
      );
    }
    
    // Criar pagamento
    const payment = await prisma.payment.create({
      data: {
        treatment_id,
        valor_pago,
        forma_pagamento,
        recebido_por_id: userId!,
        comprovante_url,
        observacao,
      },
      include: {
        treatment: {
          select: {
            id: true,
            descricao: true,
            valor_total: true,
          },
        },
        recebido_por: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
    
    // Atualizar valor_pago_total do tratamento
    const newTotalPaid = await updateTreatmentTotalPaid(treatment_id);
    
    // Recalcular risco de inadimplência
    await updateTreatmentRisk(treatment_id);
    
    // Registrar auditoria
    await createAuditLog({
      userId: userId!,
      acao: AUDIT_ACTIONS.PAYMENT_CREATED,
      detalhes: {
        payment_id: payment.id,
        treatment_id,
        valor_pago,
        forma_pagamento,
        novo_valor_pago_total: newTotalPaid,
      },
    });
    
    return NextResponse.json(
      { 
        message: 'Pagamento registrado com sucesso',
        payment,
        treatment: {
          id: treatment_id,
          valor_pago_total: newTotalPaid,
          valor_total: Number(treatment.valor_total),
          saldo_devedor: Number(treatment.valor_total) - newTotalPaid,
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    
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

// GET /api/payments - Listar pagamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const treatmentId = searchParams.get('treatment_id');
    const formaPagamento = searchParams.get('forma_pagamento');
    
    // Construir filtros
    const where: Record<string, unknown> = {};
    
    if (treatmentId) {
      where.treatment_id = treatmentId;
    }
    
    if (formaPagamento) {
      where.forma_pagamento = formaPagamento;
    }
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          treatment: {
            select: {
              id: true,
              descricao: true,
              valor_total: true,
              patient: {
                select: {
                  nome: true,
                },
              },
            },
          },
          recebido_por: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { data: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);
    
    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
