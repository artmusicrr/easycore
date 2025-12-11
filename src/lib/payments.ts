// ================================
// EasyCore - Cálculo de Pagamentos
// ================================

import prisma from './prisma';

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
  }
  // Nota: lógica de 'atrasado' deve considerar datas de vencimento
  
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
