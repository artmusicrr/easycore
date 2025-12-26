'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { patientService } from '@/services'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, User, Phone, Mail, FileText, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/utils/utils'

interface Patient {
  id: string
  nome: string
  telefone: string
  email: string
  data_cadastro: string
  consentimento_lgpd: boolean
  _count: {
    treatments: number
  }
}

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => patientService.getAll({ page, limit: 10, search }),
  })

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'nome',
      header: 'Paciente',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-secondary-500" />
          </div>
          <div>
            <div className="font-semibold text-secondary-900">{row.original.nome}</div>
            <div className="text-xs text-secondary-500">{row.original.email || 'Sem email'}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'telefone',
      header: 'Telefone',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-600">
          <Phone className="h-3.5 w-3.5 mr-2 opacity-60" />
          {row.original.telefone || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'data_cadastro',
      header: 'Cadastro',
      cell: ({ row }) => (
        <div className="text-secondary-500">
           {formatDate(row.original.data_cadastro)}
        </div>
      ),
    },
    {
      accessorKey: 'treatments',
      header: 'Tratamentos',
      cell: ({ row }) => (
        <Badge variant="info">
           {row.original._count.treatments} tratamentos
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end space-x-2">
           <Link href={`/patients/${row.original.id}`}>
             <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Detalhes
             </Button>
           </Link>
           <Button variant="ghost" size="sm" className="px-2">
              <MoreHorizontal className="h-4 w-4 text-secondary-400" />
           </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pacientes</h1>
          <p className="text-sm text-secondary-500">Gestão e cadastro de pacientes da clínica.</p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11">
           Filtros
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.patients || []} 
        isLoading={isLoading} 
      />
    </div>
  )
}
