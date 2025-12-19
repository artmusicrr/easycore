'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { treatmentSchema, TreatmentInput } from '@/schemas'
import { treatmentService, patientService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Stethoscope, User, Calendar, DollarSign, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function NewTreatmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdParams = searchParams.get('patient_id')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: patientsData } = useQuery({
    queryKey: ['patients-search'],
    queryFn: () => patientService.getAll({ page: 1, limit: 100 }),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TreatmentInput>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      patient_id: patientIdParams || '',
      data_inicio: new Date().toISOString().split('T')[0],
    }
  })

  const onSubmit = async (data: TreatmentInput) => {
    setIsLoading(true)
    setError(null)
    try {
      await treatmentService.create(data)
      router.push('/treatments')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar tratamento.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/treatments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Novo Tratamento</h1>
          <p className="text-sm text-secondary-500">Inicie um novo procedimento ou orçamento para um paciente.</p>
        </div>
      </div>

      <Card title="Dados do Tratamento" description="Vincule um paciente e descreva o procedimento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="text-sm font-medium text-secondary-700">Paciente</label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <select 
                    className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white pl-10 pr-3 py-2 text-sm text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50"
                    {...register('patient_id')}
                  >
                    <option value="">Selecione um paciente...</option>
                    {patientsData?.patients.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
               </div>
               {errors.patient_id && <p className="text-xs font-medium text-red-500">{errors.patient_id.message}</p>}
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
              <Input 
                label="Data de Início" 
                type="date"
                className="pl-10"
                {...register('data_inicio')} 
                error={errors.data_inicio?.message} 
              />
            </div>

            <div className="md:col-span-2 relative">
               <Stethoscope className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
               <Input 
                label="Descrição do Procedimento" 
                placeholder="Ex: Canal no dente 36 + Restauração" 
                className="pl-10"
                {...register('descricao')} 
                error={errors.descricao?.message} 
              />
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
              <Input 
                label="Valor Total do Orçamento" 
                type="number"
                step="0.01"
                placeholder="0,00" 
                className="pl-10"
                {...register('valor_total', { valueAsNumber: true })} 
                error={errors.valor_total?.message} 
              />
            </div>

            <div className="flex items-end text-xs text-secondary-500 bg-secondary-50 p-3 rounded-lg border border-secondary-100 italic">
               Nota: O score de risco será calculado automaticamente após o cadastro inicial.
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-100">
             <Link href="/treatments">
                <Button variant="outline" type="button">Cancelar</Button>
             </Link>
             <Button type="submit" isLoading={isLoading} className="bg-accent-600 hover:bg-accent-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Criar Tratamento
             </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
