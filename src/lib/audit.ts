// ================================
// EasyCore - Sistema de Auditoria
// Logs imutáveis para rastreamento
// ================================

import prisma from './prisma';
import { Prisma } from '@prisma/client';

export interface AuditLogData {
  userId: string;
  acao: string;
  detalhes?: Prisma.InputJsonValue;
}

/**
 * Cria um registro de auditoria imutável
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: data.userId,
        acao: data.acao,
        detalhes: data.detalhes,
      },
    });
  } catch (error) {
    // Log de erro mas não falha a operação principal
    console.error('Erro ao criar log de auditoria:', error);
  }
}

/**
 * Lista logs de auditoria com paginação
 */
export async function getAuditLogs(options: {
  userId?: string;
  acao?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const { userId, acao, startDate, endDate, page = 1, limit = 50 } = options;
  
  const where: Record<string, unknown> = {};
  
  if (userId) where.user_id = userId;
  if (acao) where.acao = { contains: acao };
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) (where.timestamp as Record<string, Date>).gte = startDate;
    if (endDate) (where.timestamp as Record<string, Date>).lte = endDate;
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Ações de auditoria padronizadas
export const AUDIT_ACTIONS = {
  // Usuários
  USER_CREATED: 'USER_CREATED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGIN_FAILED: 'USER_LOGIN_FAILED',
  USER_UPDATED: 'USER_UPDATED',
  USER_2FA_ENABLED: 'USER_2FA_ENABLED',
  USER_2FA_DISABLED: 'USER_2FA_DISABLED',
  
  // Pacientes
  PATIENT_CREATED: 'PATIENT_CREATED',
  PATIENT_UPDATED: 'PATIENT_UPDATED',
  PATIENT_CPF_ACCESSED: 'PATIENT_CPF_ACCESSED',
  
  // Tratamentos
  TREATMENT_CREATED: 'TREATMENT_CREATED',
  TREATMENT_UPDATED: 'TREATMENT_UPDATED',
  TREATMENT_STATUS_CHANGED: 'TREATMENT_STATUS_CHANGED',
  
  // Pagamentos
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_UPDATED: 'PAYMENT_UPDATED',
  
  // Sistema
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SEED_EXECUTED: 'SEED_EXECUTED',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
