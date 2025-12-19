'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { patientService, treatmentService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Stethoscope, 
  Plus,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, maskCPF } from '@/utils/utils'

export default function PatientDetailsPage() {
  const { id } = useParams() as { id: string }

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await patientService.getAll({ page: 1, limit: 1 })
      // Simulação: buscamos na lista (no backend real haveria GET /api/patients/[id])
      return response.patients.find((p: any) => p.id === id)
    },
  })

  const { data: treatmentsData, isLoading: isLoadingTreatments } = useQuery({
    queryKey: ['patient-treatments', id],
    queryFn: () => treatmentService.getAll({ patient_id: id }),
    enabled: !!id,
  })

  if (isLoadingPatient || isLoadingTreatments) {
    return <div className="space-y-6 animate-pulse">
       <div className="h-10 w-48 bg-secondary-200 rounded"></div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-secondary-200 rounded-xl"></div>
          <div className="h-64 bg-secondary-200 rounded-xl col-span-2"></div>
       </div>
    </div>
  }

  if (!patient) return <div>Paciente não encontrado.</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{patient.nome}</h1>
            <p className="text-sm text-secondary-500">Desde {formatDate(patient.data_cadastro)}</p>
          </div>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline">Editar Cadastro</Button>
           <Link href={`/treatments/new?patient_id=${id}`}>
             <Button className="bg-accent-600 hover:bg-accent-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Tratamento
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Card */}
        <div className="space-y-6">
          <Card className="text-center py-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold mb-4">
              {patient.nome.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-secondary-900">{patient.nome}</h3>
            <p className="text-sm text-secondary-500 mb-6">{patient.email || 'Sem email cadastrado'}</p>
            
            <div className="space-y-4 text-left border-t border-secondary-50 pt-6">
               <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-secondary-400 mr-3" />
                  <span className="text-secondary-700 font-medium">{patient.telefone || 'Não informado'}</span>
               </div>
               <div className="flex items-center text-sm">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-3" />
                  <span className="text-secondary-700 font-medium">CPF: {maskCPF(patient.cpf_encrypted || '')}</span>
               </div>
               <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">LGPD Compliance</p>
                  <p className="text-xs text-green-800 font-medium">Consentimento ativo para tratamento de dados.</p>
               </div>
            </div>
          </Card>
          
          <Card title="Próximo Agendamento" className="border-dashed">
             <div className="text-center py-4">
                <Clock className="h-8 w-8 text-secondary-300 mx-auto mb-2" />
                <p className="text-sm text-secondary-500 font-medium">Nenhum agendamento futuro</p>
                <Button variant="ghost" size="sm" className="mt-2 text-primary-600">Agendar agora</Button>
             </div>
          </Card>
        </div>

        {/* Treatments List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Histórico de Tratamentos" description="Todos os procedimentos realizados por este paciente">
            <div className="space-y-4">
              {treatmentsData?.treatments.length > 0 ? (
                treatmentsData.treatments.map((t: any) => (
                  <div key={t.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-secondary-100 bg-white hover:border-primary-200 hover:shadow-soft transition-all">
                    <div className="flex items-center">
                       <div className="h-10 w-10 rounded-lg bg-secondary-50 flex items-center justify-center mr-4 group-hover:bg-primary-50 transition-colors">
                          <Stethoscope className="h-5 w-5 text-secondary-400 group-hover:text-primary-600" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-secondary-900">{t.descricao}</p>
                          <p className="text-xs text-secondary-500">{formatDate(t.data_inicio)} &bull; {formatCurrency(t.valor_total)}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <Badge variant={t.status === 'pago' ? 'success' : t.status === 'atrasado' ? 'error' : 'primary'}>
                          {t.status}
                       </Badge>
                       <Link href={`/treatments/${t.id}`}>
                         <Button variant="ghost" size="sm" className="p-2">
                            <ChevronRight className="h-4 w-4" />
                         </Button>
                       </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-secondary-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Este paciente ainda não possui tratamentos.</p>
                  <Link href={`/treatments/new?patient_id=${id}`}>
                    <Button variant="outline" size="sm" className="mt-4">Iniciar Primeiro Tratamento</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
