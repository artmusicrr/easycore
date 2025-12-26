'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { api } from '@/services/api'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ClipboardList, Shield, User, Clock, Search } from 'lucide-react'
import { formatDate } from '@/utils/utils'

interface AuditLog {
  id: string
  acao: string
  detalhes: string
  ip_address: string
  user_agent: string
  created_at: string
  user: {
    nome: string
    email: string
  }
}

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await api.get('/audit-logs')
      return response.data
    },
  })

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'created_at',
      header: 'Data/Hora',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-500 whitespace-nowrap">
           <Clock className="h-3.5 w-3.5 mr-2 opacity-60" />
           {new Date(row.original.created_at).toLocaleString('pt-BR')}
        </div>
      ),
    },
    {
      accessorKey: 'user.nome',
      header: 'Usuário',
      cell: ({ row }) => (
        <div>
           <div className="font-semibold text-secondary-900">{row.original.user?.nome || 'Sistema'}</div>
           <div className="text-[10px] text-secondary-400">{row.original.user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'acao',
      header: 'Ação',
      cell: ({ row }) => (
        <Badge variant="info" className="uppercase text-[10px] tracking-wider py-1">
           {row.original.acao}
        </Badge>
      ),
    },
    {
      accessorKey: 'detalhes',
      header: 'Detalhes',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-xs text-secondary-600 font-mono">
           {row.original.detalhes}
        </div>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'Origem',
      cell: ({ row }) => (
        <div className="text-[10px] font-mono text-secondary-400">
           {row.original.ip_address}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-secondary-900">Logs de Auditoria</h1>
           </div>
           <p className="text-sm text-secondary-500">Histórico imutável de ações realizadas no sistema (Admin only).</p>
        </div>
        <Button variant="outline">Exportar CSV</Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
         <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
         <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <strong>Nota de Segurança:</strong> Estes registros são imutáveis e servem para conformidade com normas de segurança de dados. Qualquer alteração ou acesso indevido é registrado automaticamente.
         </p>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.logs || []} 
        isLoading={isLoading} 
      />
    </div>
  )
}
