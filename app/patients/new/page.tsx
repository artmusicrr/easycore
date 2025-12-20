'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, PatientInput } from '@/schemas'
import { patientService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, Mail, Fingerprint, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function NewPatientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      consentimento_lgpd: false,
    }
  })

  // Máscara de CPF simples
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    // Aplicar máscara: 000.000.000-00
    if (value.length > 3 && value.length <= 6) value = `${value.slice(0, 3)}.${value.slice(3)}`
    else if (value.length > 6 && value.length <= 9) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    else if (value.length > 9) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`
    
    e.target.value = value
    setValue('cpf', value)
  }

  const onSubmit = async (data: PatientInput) => {
    setIsLoading(true)
    setError(null)
    try {
      await patientService.create(data)
      router.push('/patients')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar paciente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Novo Paciente</h1>
          <p className="text-sm text-secondary-500">Cadastre um novo paciente no sistema seguindo as normas da LGPD.</p>
        </div>
      </div>

      <Card title="Informações Pessoais" description="Dados básicos e de contato do paciente">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-2">
            <div className="relative">
               <User className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
               <Input 
                label="Nome Completo" 
                placeholder="Ex: Maria Oliveira Santos" 
                className="pl-10"
                {...register('nome')} 
                error={errors.nome?.message} 
              />
            </div>
          </div>

          <div className="relative">
            <Fingerprint className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
            <Input 
              label="CPF" 
              placeholder="000.000.000-00" 
              className="pl-10"
              {...register('cpf')} 
              onChange={handleCPFChange}
              error={errors.cpf?.message} 
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
            <Input 
              label="Telefone / WhatsApp" 
              placeholder="(11) 99999-9999" 
              className="pl-10"
              {...register('telefone')} 
              error={errors.telefone?.message} 
            />
          </div>

          <div className="md:col-span-2 relative">
            <Mail className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
            <Input 
              label="Email" 
              type="email"
              placeholder="paciente@exemplo.com" 
              className="pl-10"
              {...register('email')} 
              error={errors.email?.message} 
            />
          </div>

          <div className="md:col-span-2 p-4 rounded-xl border border-primary-100 bg-primary-50/50">
             <div className="flex items-start space-x-3">
               <div className="mt-1">
                 <input 
                  type="checkbox" 
                  id="lgpd"
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  {...register('consentimento_lgpd')}
                 />
               </div>
               <label htmlFor="lgpd" className="text-sm text-secondary-700 leading-relaxed font-medium">
                  Confirmo que o paciente forneceu consentimento para o tratamento de seus dados pessoais de acordo com a <span className="text-primary-600 font-bold">LGPD</span>. 
                  Este dado é obrigatório para fins regulatórios e de segurança.
               </label>
             </div>
             {errors.consentimento_lgpd && <p className="mt-2 text-xs font-medium text-red-500">{errors.consentimento_lgpd.message}</p>}
          </div>

          {error && (
            <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-secondary-100">
             <Link href="/patients">
                <Button variant="outline" type="button">Cancelar</Button>
             </Link>
             <Button type="submit" isLoading={isLoading}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Cadastrar Paciente
             </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
