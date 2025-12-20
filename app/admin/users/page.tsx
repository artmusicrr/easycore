'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { api } from '@/services/api'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/schemas'
import { Users, UserPlus, ShieldAlert, CheckCircle2, Mail, Lock, UserCog } from 'lucide-react'

interface UserAdmin {
  id: string
  nome: string
  email: string
  role: 'recepcao' | 'dentista' | 'admin'
  created_at: string
}

export default function UsersAdminPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users')
      return response.data
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'recepcao',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RegisterInput) => api.post('/users/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setShowAddForm(false)
      reset()
    },
  })

  const columns: ColumnDef<UserAdmin>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => <span className="font-semibold text-secondary-900">{row.original.nome}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-secondary-600">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Nível de Acesso',
      cell: ({ row }) => {
        const variants = {
          admin: 'error' as const,
          dentista: 'primary' as const,
          recepcao: 'secondary' as const,
        }
        return <Badge variant={variants[row.original.role]}>{row.original.role}</Badge>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-end">
           <Button variant="ghost" size="sm">Editar</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestão de Usuários</h1>
          <p className="text-sm text-secondary-500">Controle de acesso e permissões da equipe.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card title="Novo Usuário" description="Cadastre um novo membro da equipe com um nível de acesso específico">
           <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 relative">
                    <UserCog className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                    <Input 
                      label="Nome Completo" 
                      placeholder="Ex: Dr. Roberto Carlos" 
                      className="pl-10"
                      {...register('nome')} 
                      error={errors.nome?.message} 
                    />
                 </div>
                 <div className="relative">
                    <Mail className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                    <Input 
                      label="Email" 
                      placeholder="roberto@easycore.com" 
                      className="pl-10"
                      {...register('email')} 
                      error={errors.email?.message} 
                    />
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                    <Input 
                      label="Senha Inicial" 
                      type="password"
                      placeholder="••••••••" 
                      className="pl-10"
                      {...register('senha')} 
                      error={errors.senha?.message} 
                    />
                 </div>
                 <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-secondary-700">Perfil de Acesso</label>
                    <select 
                      className="flex h-10 w-full rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                      {...register('role')}
                    >
                       <option value="recepcao">Recepção</option>
                       <option value="dentista">Dentista / Profissional</option>
                       <option value="admin">Administrador Geral</option>
                    </select>
                 </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-secondary-100">
                 <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>Cancelar</Button>
                 <Button type="submit" isLoading={mutation.isPending}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Criar Usuário
                 </Button>
              </div>
           </form>
        </Card>
      )}

      <DataTable 
        columns={columns} 
        data={data?.users || []} 
        isLoading={isLoading} 
      />
    </div>
  )
}
