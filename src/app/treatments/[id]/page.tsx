'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { treatmentService, paymentService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RiskIndicator } from '@/components/ui/RiskIndicator'
import { 
  ArrowLeft, 
  Stethoscope, 
  User, 
  Calendar, 
  DollarSign, 
  Clock,
  Plus,
  FileText,
  CreditCard,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/utils/utils'

export default function TreatmentDetailsPage() {
  const { id } = useParams() as { id: string }

  const { data, isLoading } = useQuery({
    queryKey: ['treatment', id],
    queryFn: () => treatmentService.getById(id),
  })

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-secondary-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-secondary-200 rounded-xl col-span-2"></div>
        <div className="h-64 bg-secondary-200 rounded-xl"></div>
      </div>
    </div>
  }

  const { treatment } = data
  const { financeiro, risco } = treatment

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/treatments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
               <h1 className="text-2xl font-bold text-secondary-900">Tratamento</h1>
               <Badge variant={treatment.status === 'pago' ? 'success' : treatment.status === 'atrasado' ? 'error' : 'primary'}>
                  {treatment.status}
               </Badge>
            </div>
            <p className="text-sm text-secondary-500">ID: {treatment.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <Button variant="outline">Imprimir Orçamento</Button>
           <Button className="bg-accent-600 hover:bg-accent-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pagamento
           </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & History */}
        <div className="lg:col-span-2 space-y-6">
           <Card title="Visão Geral do Procedimento">
              <div className="space-y-6">
                 <div>
                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Descrição</span>
                    <p className="mt-1 text-secondary-700 leading-relaxed font-medium">{treatment.descricao}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Paciente</span>
                       <div className="mt-2 flex items-center p-3 rounded-lg bg-secondary-50 border border-secondary-100">
                          <User className="h-4 w-4 text-primary-600 mr-3" />
                          <span className="text-sm font-semibold text-secondary-900">{treatment.patient.nome}</span>
                       </div>
                    </div>
                    <div>
                       <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Dentista Responsável</span>
                       <div className="mt-2 flex items-center p-3 rounded-lg bg-secondary-50 border border-secondary-100">
                          <Stethoscope className="h-4 w-4 text-accent-600 mr-3" />
                          <span className="text-sm font-semibold text-secondary-900">{treatment.dentista.nome}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center space-x-6 pt-4 border-t border-secondary-50">
                    <div className="flex items-center">
                       <Calendar className="h-4 w-4 text-secondary-400 mr-2" />
                       <span className="text-xs font-medium text-secondary-500">Iniciado em: {formatDate(treatment.data_inicio)}</span>
                    </div>
                    {treatment.data_fim && (
                       <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-xs font-medium text-secondary-500">Finalizado em: {formatDate(treatment.data_fim)}</span>
                       </div>
                    )}
                 </div>
              </div>
           </Card>

           <Card title="Histórico de Pagamentos" footer={
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary-500 font-medium">Total de registros: {treatment.payments.length}</span>
                 <Link href={`/payments/${treatment.id}`} className="text-primary-600 font-bold flex items-center hover:underline">
                    Ver relatório completo
                    <ChevronRight className="h-4 w-4 ml-1" />
                 </Link>
              </div>
           }>
              <div className="space-y-4">
                 {treatment.payments.length > 0 ? (
                    treatment.payments.map((payment: any) => (
                       <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-secondary-100 bg-white hover:bg-secondary-50 transition-colors">
                          <div className="flex items-center">
                             <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-4">
                                <DollarSign className="h-5 w-5 text-green-600" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-secondary-900">{formatCurrency(payment.valor_pago)}</p>
                                <p className="text-xs text-secondary-500">{payment.forma_pagamento} &bull; {formatDate(payment.data)}</p>
                             </div>
                          </div>
                          <Badge variant="secondary">Recebido</Badge>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-8 text-secondary-400">
                       <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                       <p className="text-sm">Nenhum pagamento registrado.</p>
                    </div>
                 )}
              </div>
           </Card>
        </div>

        {/* Right Column - Financials & Risk */}
        <div className="space-y-6">
           <Card title="Saúde Financeira" className="bg-secondary-900 text-white border-none shadow-glass">
              <div className="space-y-6">
                 <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-2">Resumo de Saldo</p>
                    <div className="flex items-end justify-between">
                       <h2 className="text-3xl font-black text-white">{formatCurrency(financeiro.saldoDevedor)}</h2>
                       <span className="text-xs font-medium text-red-400 mb-1">Pendente</span>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-secondary-800">
                    <div className="flex justify-between text-sm">
                       <span className="text-secondary-400">Valor Total</span>
                       <span className="font-bold">{formatCurrency(financeiro.valorTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-secondary-400">Total Pago</span>
                       <span className="font-bold text-green-400">{formatCurrency(financeiro.valorPago)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-secondary-400">Progresso</span>
                       <span className="font-bold">{financeiro.percentualPago}%</span>
                    </div>
                 </div>

                 <div className="pt-2">
                    <div className="h-2 w-full bg-secondary-800 rounded-full overflow-hidden">
                       <div className="h-full bg-primary-500 rounded-full" style={{ width: `${financeiro.percentualPago}%` }}></div>
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Análise de Risco">
              <div className="space-y-4">
                 <RiskIndicator score={risco.score} level={risco.nivel} />
                 <p className="text-xs text-secondary-500 leading-relaxed bg-secondary-50 p-3 rounded-lg">
                    Este score é calculado com base no histórico de pagamentos, atrasos e comportamento do paciente em tratamentos anteriores.
                 </p>
              </div>
           </Card>

           <Card title="Sessões do Tratamento" className="border-dashed border-2 bg-transparent">
              <div className="text-center py-6 text-secondary-400">
                 <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                 <p className="text-sm font-medium">Módulo de Sessões</p>
                 <p className="text-[10px] mt-1 uppercase tracking-widest font-bold text-secondary-500">Em Breve (n8n)</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
