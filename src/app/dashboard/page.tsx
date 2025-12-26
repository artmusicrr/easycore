'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  Stethoscope, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  Loader2
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { formatCurrency } from '@/utils/utils'

interface DashboardStats {
  activePatients: number
  openTreatments: number
  monthlyRevenue: number
  riskIndex: number
  chartData: Array<{
    name: string
    receita: number
    atendimentos: number
  }>
  recentTreatments: Array<{
    id: string
    patient: string
    treatment: string
    status: string
    risk: string
    value: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do dashboard')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Erro ao carregar dados</p>
          <p className="text-secondary-600 text-sm">{error || 'Dados não disponíveis'}</p>
        </div>
      </div>
    )
  }

  const STATS = [
    { label: 'Pacientes Ativos', value: stats.activePatients.toString(), icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Tratamentos Abertos', value: stats.openTreatments.toString(), icon: Stethoscope, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Receita Mensal', value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Índice de Risco', value: `${stats.riskIndex.toFixed(0)}%`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard Geral</h1>
        <p className="text-sm text-secondary-500">Bem-vindo ao painel administrativo do EasyCore.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className={cn('rounded-xl p-3', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-secondary-900">{stat.value}</h3>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Evolução de Receita" description="Acompanhamento mensal da receita bruta da clínica">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Receita']}
                />
                <Bar dataKey="receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Atendimentos Mensais" description="Volume de atendimentos realizados por mês">
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   formatter={(value: number | undefined) => [value || 0, 'Atendimentos']}
                />
                <Line type="monotone" dataKey="atendimentos" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Treatments Table */}
        <Card className="lg:col-span-2" title="Tratamentos Recentes" description="Últimos tratamentos iniciados no sistema">
           <div className="mt-4 overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-secondary-100 font-medium text-secondary-500">
                    <th className="pb-3 text-left pl-0">Paciente</th>
                    <th className="pb-3 text-left">Tratamento</th>
                    <th className="pb-3 text-left text-center">Risco</th>
                    <th className="pb-3 text-left">Valor</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {stats.recentTreatments.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="py-4 pl-0 font-medium text-secondary-900">{item.patient}</td>
                      <td className="py-4 text-secondary-600">{item.treatment}</td>
                      <td className="py-4 text-center">
                        <Badge variant={item.risk === 'critico' ? 'error' : item.risk === 'medio' ? 'warning' : 'success'}>
                          {item.risk}
                        </Badge>
                      </td>
                      <td className="py-4 font-mono text-secondary-700">{formatCurrency(item.value)}</td>
                      <td className="py-4 text-right">
                         <div className="flex items-center justify-end space-x-1.5 font-medium">
                            {item.status === 'pago' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : item.status === 'atrasado' ? <AlertCircle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-primary-600" />}
                            <span className={cn(item.status === 'pago' ? 'text-green-700' : item.status === 'atrasado' ? 'text-red-700' : 'text-primary-700')}>
                               {item.status}
                            </span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </Card>

        {/* Action Quick Links / Alerts */}
        <div className="space-y-6">
           <Card title="Alertas de Sistema" className="border-l-4 border-l-red-500">
              <div className="space-y-4">
                 <div className="flex items-start space-x-3 rounded-lg bg-red-50 p-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-sm font-semibold text-red-900">Inadimplência Crítica</p>
                       <p className="text-xs text-red-700">3 tratamentos em atraso com risco alto.</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-3 rounded-lg bg-amber-50 p-3">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-sm font-semibold text-amber-900">Agendamentos Pendentes</p>
                       <p className="text-xs text-amber-700">12 pacientes aguardando confirmação (n8n).</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Ações Rápidas">
              <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-center justify-center rounded-xl bg-primary-600 p-4 text-white shadow-sm transition-all hover:bg-primary-700">
                    <Users className="mb-2 h-6 w-6" />
                    <span className="text-xs font-semibold">Novo Paciente</span>
                 </button>
                 <button className="flex flex-col items-center justify-center rounded-xl bg-accent-600 p-4 text-white shadow-sm transition-all hover:bg-accent-700">
                    <DollarSign className="mb-2 h-6 w-6" />
                    <span className="text-xs font-semibold">Registrar Pagto</span>
                 </button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
