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
 * PLACEHOLDER: Em produção, substituir por modelo de IA
 * 
 * @returns Valor entre 0 (baixo risco) e 1 (alto risco)
 */
export async function calculateRiskScore(treatmentId: string): Promise<number> {
  try {
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: {
        payments: true,
        patient: {
          include: {
            treatments: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    if (!treatment) {
      throw new Error('Tratamento não encontrado');
    }

    // Fatores de risco básicos
    const valorTotal = Number(treatment.valor_total);
    const valorPago = Number(treatment.valor_pago_total);
    const paymentPercentage = valorTotal > 0 ? valorPago / valorTotal : 0;
    
    // Dias desde o início do tratamento
    const daysSinceStart = Math.floor(
      (Date.now() - treatment.data_inicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Frequência de pagamentos esperada (exemplo: 1 pagamento a cada 30 dias)
    const expectedPayments = Math.floor(daysSinceStart / 30);
    const actualPayments = treatment.payments.length;
    
    // Histórico do paciente em outros tratamentos
    const patientTreatments = treatment.patient.treatments;
    const completedTreatments = patientTreatments.filter(t => t.status === 'pago').length;
    const totalTreatments = patientTreatments.length;
    const patientHistory = totalTreatments > 1 
      ? completedTreatments / (totalTreatments - 1) 
      : 0.5; // Sem histórico = risco médio
    
    // Cálculo do score (fórmula simplificada)
    // Em produção, usar modelo de ML treinado
    let riskScore = 0;
    
    // Peso 1: Percentual não pago (40%)
    riskScore += (1 - paymentPercentage) * 0.4;
    
    // Peso 2: Atraso em pagamentos (30%)
    if (expectedPayments > 0) {
      const paymentDelay = Math.max(0, 1 - (actualPayments / expectedPayments));
      riskScore += paymentDelay * 0.3;
    }
    
    // Peso 3: Histórico do paciente (20%)
    riskScore += (1 - patientHistory) * 0.2;
    
    // Peso 4: Status do tratamento (10%)
    if (treatment.status === 'atrasado') {
      riskScore += 0.1;
    }
    
    // Limitar entre 0 e 1
    return Math.min(1, Math.max(0, riskScore));
    
  } catch (error) {
    console.error('Erro ao calcular risco:', error);
    return 0.5; // Retorna risco médio em caso de erro
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
