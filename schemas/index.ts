import { z } from 'zod'

// --------------------------------
// Auth
// --------------------------------
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
  two_factor_code: z.string().length(6, 'O código deve ter 6 dígitos').optional().or(z.literal('')),
})

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  role: z.enum(['recepcao', 'dentista', 'admin']),
})

// --------------------------------
// Patients
// --------------------------------
export const patientSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  telefone: z.string().optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  consentimento_lgpd: z.boolean().refine(val => val === true, 'Consentimento LGPD é obrigatório'),
})

// --------------------------------
// Treatments
// --------------------------------
export const treatmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  dentista_id: z.string().uuid('ID do dentista inválido').optional(),
  descricao: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  valor_total: z.number().positive('Valor deve ser positivo'),
  data_inicio: z.string().optional(),
})

// --------------------------------
// Payments
// --------------------------------
export const paymentSchema = z.object({
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
  comprovante_url: z.string().url('URL inválida').optional().or(z.literal('')),
  observacao: z.string().max(500).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type TreatmentInput = z.infer<typeof treatmentSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
