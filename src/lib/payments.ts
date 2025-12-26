// ================================
// EasyCore - Cálculo de Pagamentos
// ================================

import prisma from './prisma';

import { addMonths, setDate } from 'date-fns';

/**
 * Atualiza o valor_pago_total de um tratamento
 * Soma todos os pagamentos relacionados
 */
export async function updateTreatmentTotalPaid(treatmentId: string): Promise<number> {
  // Buscar todos os pagamentos do tratamento
  const payments = await prisma.payment.findMany({
    where: { treatment_id: treatmentId },
    select: { valor_pago: true },
  });
  
  // Somar valores
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.valor_pago),
    0
  );
  
  // Buscar tratamento para verificar valor total
  const treatment = await prisma.treatment.findUnique({
    where: { id: treatmentId },
    select: { valor_total: true },
  });
  
  if (!treatment) {
    throw new Error('Tratamento não encontrado');
  }
  
  const valorTotal = Number(treatment.valor_total);
  
  // Determinar novo status
  let newStatus: 'aberto' | 'pago' | 'atrasado' = 'aberto';
  if (totalPaid >= valorTotal) {
    newStatus = 'pago';
  } else {
    // Verificar se há parcelas atrasadas se o tratamento tiver um plano
    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { treatment_id: treatmentId },
      include: {
        installments: {
          where: {
            status: { in: ['atrasada', 'em_aberto'] },
            data_vencimento: { lt: new Date() }
          }
        }
      }
    });

    if (paymentPlan && paymentPlan.installments.length > 0) {
      newStatus = 'atrasado';
    }
  }
  
  // Atualizar tratamento
  await prisma.treatment.update({
    where: { id: treatmentId },
    data: {
      valor_pago_total: totalPaid,
      status: newStatus,
      data_fim: newStatus === 'pago' ? new Date() : null,
    },
  });
  
  return totalPaid;
}

/**
 * Cria um plano de parcelamento para um tratamento
 */
export async function createPaymentPlan(data: {
  treatment_id: string;
  total_parcelas: number;
  data_inicio: Date;
  dia_vencimento: number;
}) {
  const treatment = await prisma.treatment.findUnique({
    where: { id: data.treatment_id },
  });

  if (!treatment) throw new Error('Tratamento não encontrado');
  if (data.total_parcelas > 24) throw new Error('Máximo de 24 parcelas permitido');

  const valorTotal = Number(treatment.valor_total);
  const valorParcela = valorTotal / data.total_parcelas;

  return await prisma.$transaction(async (tx) => {
    const plan = await tx.paymentPlan.create({
      data: {
        treatment_id: data.treatment_id,
        total_parcelas: data.total_parcelas,
        valor_parcela: valorParcela,
        data_inicio: data.data_inicio,
        dia_vencimento: data.dia_vencimento,
      },
    });

    const installments = [];
    for (let i = 1; i <= data.total_parcelas; i++) {
      // Calcular data de vencimento
      let date = addMonths(data.data_inicio, i - 1);
      date = setDate(date, data.dia_vencimento);

      installments.push({
        payment_plan_id: plan.id,
        numero_parcela: i,
        valor_esperado: valorParcela,
        data_vencimento: date,
        status: 'em_aberto' as const,
      });
    }

    await tx.installment.createMany({
      data: installments,
    });

    return plan;
  });
}

/**
 * Processa o pagamento de uma parcela
 */
export async function processInstallmentPayment(data: {
  installment_id: string;
  valor_pago: number;
  forma_pagamento: any;
  recebido_por_id: string;
  comprovante_url?: string;
  observacao?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const installment = await tx.installment.findUnique({
      where: { id: data.installment_id },
      include: { payment_plan: true },
    });

    if (!installment) throw new Error('Parcela não encontrada');

    // Registrar pagamento (mesmo que valor seja 0)
    const payment = await tx.payment.create({
      data: {
        treatment_id: installment.payment_plan.treatment_id,
        installment_id: data.installment_id,
        valor_pago: data.valor_pago,
        forma_pagamento: data.forma_pagamento,
        recebido_por_id: data.recebido_por_id,
        comprovante_url: data.comprovante_url,
        observacao: data.observacao,
      },
    });

    // Atualizar parcela
    const novoValorPago = Number(installment.valor_pago) + data.valor_pago;
    const pagaTotalmente = novoValorPago >= Number(installment.valor_esperado);

    await tx.installment.update({
      where: { id: data.installment_id },
      data: {
        valor_pago: novoValorPago,
        data_pagamento: data.valor_pago > 0 ? new Date() : installment.data_pagamento,
        status: pagaTotalmente ? 'paga' : installment.status,
      },
    });

    // Atualizar tratamento
    // Note: We call updateTreatmentTotalPaid outside the transaction or use tx
    // To keep it simple, let's update it here or ensure the non-tx version is called after.
    
    return payment;
  });
}

/**
 * Atualiza status de parcelas atrasadas
 */
export async function updateOverdueInstallments() {
  const now = new Date();
  
  // Parcelas em_aberto com vencimento passado viram atrasada
  await prisma.installment.updateMany({
    where: {
      status: 'em_aberto',
      data_vencimento: { lt: now },
      valor_pago: { lt: prisma.installment.fields.valor_esperado }
    },
    data: {
      status: 'atrasada'
    }
  });

  // Calote: Parcela atrasada > 60 dias
  const caloteDate = new Date();
  caloteDate.setDate(caloteDate.getDate() - 60);

  await prisma.installment.updateMany({
    where: {
      status: 'atrasada',
      data_vencimento: { lt: caloteDate },
      is_calote: false
    },
    data: {
      is_calote: true
    }
  });
}

/**
 * Calcula o saldo devedor de um tratamento
 */
export async function getTreatmentBalance(treatmentId: string): Promise<{
  valorTotal: number;
  valorPago: number;
  saldoDevedor: number;
  percentualPago: number;
}> {
  const treatment = await prisma.treatment.findUnique({
    where: { id: treatmentId },
    select: {
      valor_total: true,
      valor_pago_total: true,
    },
  });
  
  if (!treatment) {
    throw new Error('Tratamento não encontrado');
  }
  
  const valorTotal = Number(treatment.valor_total);
  const valorPago = Number(treatment.valor_pago_total);
  const saldoDevedor = valorTotal - valorPago;
  const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;
  
  return {
    valorTotal,
    valorPago,
    saldoDevedor,
    percentualPago: Math.round(percentualPago * 100) / 100,
  };
}
