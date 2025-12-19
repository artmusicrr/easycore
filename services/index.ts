import { api } from './api'
import { LoginInput, RegisterInput, PatientInput, TreatmentInput, PaymentInput } from '../schemas'

export const authService = {
  login: async (data: LoginInput) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
  register: async (data: RegisterInput) => {
    const response = await api.post('/users/register', data)
    return response.data
  },
}

export const patientService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/patients', { params })
    return response.data
  },
  create: async (data: PatientInput) => {
    const response = await api.post('/patients', data)
    return response.data
  },
}

export const treatmentService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; patient_id?: string }) => {
    const response = await api.get('/treatments', { params })
    return response.data
  },
  getById: async (id: string) => {
    const response = await api.get(`/treatments/${id}`)
    return response.data
  },
  create: async (data: TreatmentInput) => {
    const response = await api.post('/treatments', data)
    return response.data
  },
  update: async (id: string, data: Partial<TreatmentInput>) => {
    const response = await api.put(`/treatments/${id}`, data)
    return response.data
  },
}

export const paymentService = {
  getAll: async (params?: { page?: number; limit?: number; treatment_id?: string; forma_pagamento?: string }) => {
    const response = await api.get('/payments', { params })
    return response.data
  },
  getByTreatment: async (treatmentId: string) => {
    const response = await api.get(`/payments/${treatmentId}`)
    return response.data
  },
  create: async (data: PaymentInput) => {
    const response = await api.post('/payments', data)
    return response.data
  },
}

export const healthService = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  },
}
