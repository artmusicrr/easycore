'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { treatmentService } from '@/services'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Calendar, User, Stethoscope, Filter, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/utils/utils'

interface Treatment {
  id: string
  descricao: string
  valor_total: number
  valor_pago_total: number
  status: 'aberto' | 'pago' | 'atrasado'
  data_inicio: string
  risco_inadimplencia: number
  patient: {
    nome: string
  }
  dentista: {
    nome: string
  }
}

export default function TreatmentsPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['treatments', page, status],
    queryFn: () => treatmentService.getAll({ page, limit: 10, status }),
  })

  const columns: ColumnDef<Treatment>[] = [
    {
      accessorKey: 'patient.nome',
      header: 'Paciente',
      cell: ({ row }) => (
        <div className="font-semibold text-secondary-900">{row.original.patient.nome}</div>
      ),
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-secondary-600">{row.original.descricao}</div>
      ),
    },
    {
      accessorKey: 'valor_total',
      header: 'Financeiro',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-secondary-900">{formatCurrency(row.original.valor_total)}</div>
          <div className="text-[10px] text-secondary-400">Pago: {formatCurrency(row.original.valor_pago_total)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'data_inicio',
      header: 'Início',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-500">
           <Calendar className="h-3 w-3 mr-1.5 opacity-60" />
           {formatDate(row.original.data_inicio)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'pago' ? 'success' : row.original.status === 'atrasado' ? 'error' : 'primary'}>
           {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
           <Link href={`/treatments/${row.original.id}`}>
             <Button variant="outline" size="sm">
                Acessar
                <ArrowRight className="h-4 w-4 ml-2" />
             </Button>
           </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tratamentos</h1>
          <p className="text-sm text-secondary-500">Acompanhamento de procedimentos e orçamentos.</p>
        </div>
        <Link href="/treatments/new">
          <Button className="bg-accent-600 hover:bg-accent-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tratamento
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-secondary-200">
        <div className="flex-1 flex items-center px-3 border-r border-secondary-100">
           <Search className="h-4 w-4 text-secondary-400 mr-3" />
           <input 
            type="text" 
            placeholder="Pesquisar tratamentos..." 
            className="w-full h-10 border-none bg-transparent text-sm outline-none placeholder:text-secondary-400"
          />
        </div>
        <div className="flex items-center space-x-2 px-3">
           <Filter className="h-4 w-4 text-secondary-400 mr-2" />
           <select 
            className="bg-transparent text-sm font-medium text-secondary-600 outline-none cursor-pointer"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
             <option value="">Todos os Status</option>
             <option value="aberto">Em aberto</option>
             <option value="pago">Finalizados/Pagos</option>
             <option value="atrasado">Em atraso</option>
           </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.treatments || []} 
        isLoading={isLoading} 
      />
    </div>
  )
}
