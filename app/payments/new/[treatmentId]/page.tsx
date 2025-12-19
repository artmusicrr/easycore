'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSchema, PaymentInput } from '@/schemas'
import { paymentService, treatmentService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/utils'

export default function NewPaymentPage() {
  const { treatmentId } = useParams() as { treatmentId: string }
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: treatmentData } = useQuery({
    queryKey: ['treatment-brief', treatmentId],
    queryFn: () => treatmentService.getById(treatmentId),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      treatment_id: treatmentId,
    }
  })

  const onSubmit = async (data: PaymentInput) => {
    setIsLoading(true)
    setError(null)
    try {
      await paymentService.create(data)
      router.push(`/treatments/${treatmentId}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar pagamento.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!treatmentData) return null

  const { treatment } = treatmentData
  const { financeiro } = treatment

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/treatments/${treatmentId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Registrar Pagamento</h1>
          <p className="text-sm text-secondary-500">Adicione uma nova entrada financeira para este tratamento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Saldo Devedor</span>
            <p className="text-xl font-black text-primary-900">{formatCurrency(financeiro.saldoDevedor)}</p>
         </div>
         <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Total Pago</span>
            <p className="text-xl font-black text-green-900">{formatCurrency(financeiro.valorPago)}</p>
         </div>
         <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Total Tratamento</span>
            <p className="text-xl font-black text-secondary-900">{formatCurrency(financeiro.valorTotal)}</p>
         </div>
      </div>

      <Card title="Dados do Pagamento" description="Informe o valor e a forma de recebimento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="relative">
              <DollarSign className="absolute left-3 top-9 h-4 w-4 text-green-600" />
              <Input 
                label="Valor Recebido" 
                type="number"
                step="0.01"
                placeholder="0,00" 
                className="pl-10 text-lg font-bold"
                {...register('valor_pago', { valueAsNumber: true })} 
                error={errors.valor_pago?.message} 
              />
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-medium text-secondary-700">Forma de Pagamento</label>
               <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <select 
                    className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white pl-10 pr-3 py-2 text-sm font-medium text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    {...register('forma_pagamento')}
                  >
                    <option value="">Selecione...</option>
                    <option value="PIX">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="boleto">Boleto</option>
                    <option value="transferencia">Transferência Bancária</option>
                  </select>
               </div>
               {errors.forma_pagamento && <p className="text-xs font-medium text-red-500">{errors.forma_pagamento.message}</p>}
            </div>

            <div className="relative">
               <FileText className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
               <Input 
                label="URL do Comprovante (Opcional)" 
                placeholder="https://link-do-comprovante.com" 
                className="pl-10"
                {...register('comprovante_url')} 
                error={errors.comprovante_url?.message} 
              />
            </div>

            <div className="relative">
               <Input 
                label="Observações" 
                placeholder="Ex: Pagamento da primeira parcela..." 
                {...register('observacao')} 
                error={errors.observacao?.message} 
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-100">
             <Link href={`/treatments/${treatmentId}`}>
                <Button variant="outline" type="button">Cancelar</Button>
             </Link>
             <Button type="submit" isLoading={isLoading} className="bg-green-600 hover:bg-green-700 h-12 px-8">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Confirmar Recebimento
             </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
