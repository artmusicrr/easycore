// ================================
// EasyCore - Cálculo de Risco de Inadimplência
// Placeholder para integração com IA
// ================================

import prisma from './prisma';

export interface RiskFactors {
  paymentHistory: number;      // Histórico de pagamentos (0-1)
  daysOverdue: number;         // Dias em atraso
  paymentPercentage: number;   // Percentual já pago
  patientHistory: number;      // Histórico do paciente (0-1)
}

/**
 * Calcula o risco de inadimplência de um tratamento
 * Baseado em parcelas atrasadas, tempo de atraso e pagamentos de valor 0.
 * 
 * @returns Valor entre 0 (baixo risco) e 100 (alto risco)
 */
export async function calculateRiskScore(treatmentId: string): Promise<number> {
  try {
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        payments: true,
        payment_plan: {
          include: {
            installments: true,
          },
        },
      },
    });

    if (!treatment) {
      throw new Error('Tratamento não encontrado');
    }

    let riskScore = 0;

    // 1. Percentual de valor pago (Peso: 25%)
    const valorTotal = Number(treatment.valor_total);
    const valorPago = Number(treatment.valor_pago_total);
    const unpaidPercentage = valorTotal > 0 ? (valorTotal - valorPago) / valorTotal : 0;
    riskScore += unpaidPercentage * 25;

    // Se houver plano de parcelamento, o cálculo é mais preciso
    if (treatment.payment_plan) {
      const installments = treatment.payment_plan.installments;
      const overdueInstallments = installments.filter(i => i.status === 'atrasada');
      const zeroPayments = treatment.payments.filter(p => Number(p.valor_pago) === 0).length;

      // 2. Número de parcelas atrasadas (Peso: 35%)
      // Máximo de 24 parcelas. 5 ou mais atrasadas = risco máximo nesse critério.
      const overdueRatio = Math.min(overdueInstallments.length / 5, 1);
      riskScore += overdueRatio * 35;

      // 3. Tempo médio de atraso (Peso: 25%)
      if (overdueInstallments.length > 0) {
        const now = new Date();
        const totalDelayDays = overdueInstallments.reduce((sum, inst) => {
          const delay = Math.floor((now.getTime() - inst.data_vencimento.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.max(0, delay);
        }, 0);
        
        const avgDelay = totalDelayDays / overdueInstallments.length;
        // 60 dias de atraso médio = risco máximo nesse critério
        const delayRatio = Math.min(avgDelay / 60, 1);
        riskScore += delayRatio * 25;
      }

      // 4. Histórico de pagamentos com valor 0 (Peso: 15%)
      // 3 ou mais pagamentos zero = risco máximo nesse critério
      const zeroRatio = Math.min(zeroPayments / 3, 1);
      riskScore += zeroRatio * 15;
      
    } else {
      // Se não houver plano, usar lógica genérica (Peso total: 100% no percentual não pago ou status)
      riskScore = unpaidPercentage * 80;
      if (treatment.status === 'atrasado') {
        riskScore += 20;
      }
    }

    // Limitar entre 0 e 100
    return Math.min(100, Math.max(0, Math.round(riskScore)));
    
  } catch (error) {
    console.error('Erro ao calcular risco:', error);
    return 50; // Retorna risco médio (50) em caso de erro
  }
}

/**
 * Atualiza o risco de inadimplência de um tratamento
 */
export async function updateTreatmentRisk(treatmentId: string): Promise<number> {
  const riskScore = await calculateRiskScore(treatmentId);
  
  await prisma.treatment.update({
    where: { id: treatmentId },
    data: { risco_inadimplencia: riskScore },
  });
  
  return riskScore;
}

/**
 * Classifica o nível de risco
 */
export function getRiskLevel(score: number): 'baixo' | 'medio' | 'alto' | 'critico' {
  if (score < 0.25) return 'baixo';
  if (score < 0.5) return 'medio';
  if (score < 0.75) return 'alto';
  return 'critico';
}
