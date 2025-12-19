// ================================
// GET /api/patients/[id]
// Detalhes do paciente
// ================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, maskCPF } from '@/lib/crypto';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Buscar paciente com tratamentos
    const patientRaw = await prisma.patient.findUnique({
      where: { id },
      include: {
        treatments: {
          include: {
            dentista: {
              select: {
                id: true,
                nome: true,
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: { treatments: true }
        }
      }
    });

    if (!patientRaw) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Calcular totais financeiros e status
    let valor_total = 0;
    let valor_pago = 0;
    let max_risco = 0;
    let has_overdue = false;

    patientRaw.treatments.forEach((t: any) => {
      valor_total += Number(t.valor_total);
      valor_pago += Number(t.valor_pago_total);
      if (t.risco_inadimplencia && t.risco_inadimplencia > max_risco) {
        max_risco = t.risco_inadimplencia;
      }
      if (t.status === 'atrasado') {
        has_overdue = true;
      }
    });

    // Definir status geral
    let status_geral = 'regular';
    if (has_overdue) status_geral = 'inadimplente';
    else if (patientRaw.treatments.length > 0 && valor_total > 0 && valor_total <= valor_pago) status_geral = 'quitado';
    else if (patientRaw.treatments.length === 0) status_geral = 'novo';
    else status_geral = 'em_tratamento'; // Tem tratamentos, não tá atrasado, mas não acabou de pagar

    // Pegar último tratamento para infos de dentista e descrição
    const lastTreatment = patientRaw.treatments[0];

    const patient = {
      id: patientRaw.id,
      nome: patientRaw.nome,
      telefone: patientRaw.telefone,
      email: patientRaw.email,
      data_cadastro: patientRaw.data_cadastro,
      cpf_encrypted: patientRaw.cpf_encrypted, // Frontend deve mascarar/descriptografar se tiver permissão
      consentimento_lgpd: patientRaw.consentimento_lgpd,

      // Campos calculados
      valor_total,
      valor_pago,
      status: status_geral,
      risco_inadimplencia: max_risco,

      // Info do último tratamento
      descricao_ultimo_tratamento: lastTreatment?.descricao || 'Nenhum tratamento',
      dentista: lastTreatment?.dentista?.nome || 'N/A',

      // Tratamentos (opcional, já que pode ser pego em outra rota, mas ajuda na visualização rápida)
      treatments_count: patientRaw._count.treatments
    };

    return NextResponse.json(
      { patient },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
