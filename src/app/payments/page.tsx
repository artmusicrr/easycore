'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { paymentService } from '@/services'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Search, DollarSign, Calendar, User, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/utils'

interface Payment {
  id: string
  valor_pago: number
  forma_pagamento: string
  data: string
  observacao?: string
  treatment: {
    id: string
    descricao: string
    valor_total: number
    patient: {
      nome: string
    }
  }
  recebido_por: {
    nome: string
  }
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [formaPagamento, setFormaPagamento] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, formaPagamento],
    queryFn: () => paymentService.getAll({ page, limit: 20, forma_pagamento: formaPagamento || undefined }),
  })

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'data',
      header: 'Data',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-600">
          <Calendar className="h-3.5 w-3.5 mr-2 opacity-60" />
          {formatDate(row.original.data)}
        </div>
      ),
    },
    {
      accessorKey: 'treatment.patient.nome',
      header: 'Paciente',
      cell: ({ row }) => (
        <div className="font-semibold text-secondary-900">
          {row.original.treatment.patient.nome}
        </div>
      ),
    },
    {
      accessorKey: 'treatment.descricao',
      header: 'Tratamento',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-secondary-600">
          {row.original.treatment.descricao}
        </div>
      ),
    },
    {
      accessorKey: 'valor_pago',
      header: 'Valor',
      cell: ({ row }) => (
        <div className="flex items-center font-mono text-green-600 font-semibold">
          <DollarSign className="h-4 w-4 mr-1" />
          {formatCurrency(row.original.valor_pago)}
        </div>
      ),
    },
    {
      accessorKey: 'forma_pagamento',
      header: 'Forma',
      cell: ({ row }) => (
        <Badge variant="info">
          {row.original.forma_pagamento}
        </Badge>
      ),
    },
    {
      accessorKey: 'recebido_por.nome',
      header: 'Recebido por',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-500 text-sm">
          <User className="h-3 w-3 mr-1.5 opacity-60" />
          {row.original.recebido_por.nome}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pagamentos</h1>
          <p className="text-sm text-secondary-500">Histórico de pagamentos recebidos.</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-secondary-200">
        <div className="flex-1 flex items-center px-3 border-r border-secondary-100">
          <Search className="h-4 w-4 text-secondary-400 mr-3" />
          <input 
            type="text" 
            placeholder="Pesquisar pagamentos..." 
            className="w-full h-10 border-none bg-transparent text-sm outline-none placeholder:text-secondary-400"
          />
        </div>
        <div className="flex items-center space-x-2 px-3">
          <Filter className="h-4 w-4 text-secondary-400 mr-2" />
          <select 
            className="bg-transparent text-sm font-medium text-secondary-600 outline-none cursor-pointer"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
          >
            <option value="">Todas as formas</option>
            <option value="PIX">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="boleto">Boleto</option>
            <option value="transferencia">Transferência</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.payments || []} 
        isLoading={isLoading} 
      />
    </div>
  )
}
