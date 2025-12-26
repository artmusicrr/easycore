// ================================
// POST /api/treatments
// Criar novo tratamento
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { updateTreatmentRisk } from '@/lib/risk';

// Schema de validação
const createTreatmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente inválido'),
  dentista_id: z.string().uuid('ID do dentista inválido').optional(),
  descricao: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  valor_total: z.number().positive('Valor deve ser positivo'),
  data_inicio: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    const body = await request.json();

    // Validar dados
    const validation = createTreatmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { patient_id, dentista_id, descricao, valor_total, data_inicio } = validation.data;

    // Usar dentista_id fornecido ou o usuário atual se for dentista
    let finalDentistaId = dentista_id;
    if (!finalDentistaId) {
      if (userRole === 'dentista' && userId) {
        finalDentistaId = userId;
      } else {
        return NextResponse.json(
          { error: 'ID do dentista é obrigatório' },
          { status: 400 }
        );
      }
    }

    // Verificar se paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patient_id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se dentista existe e tem role correto
    const dentista = await prisma.user.findUnique({
      where: { id: finalDentistaId },
    });

    if (!dentista || dentista.role !== 'dentista') {
      return NextResponse.json(
        { error: 'Dentista não encontrado ou usuário não é dentista' },
        { status: 404 }
      );
    }

    // Criar tratamento
    const treatment = await prisma.treatment.create({
      data: {
        patient_id,
        dentista_id: finalDentistaId,
        descricao,
        valor_total,
        valor_pago_total: 0,
        data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
        status: 'aberto',
        risco_inadimplencia: 0.5, // Risco inicial médio
      },
      include: {
        patient: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        dentista: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    // Calcular risco inicial
    await updateTreatmentRisk(treatment.id);

    // Registrar auditoria
    await createAuditLog({
      userId: userId!,
      acao: AUDIT_ACTIONS.TREATMENT_CREATED,
      detalhes: {
        treatment_id: treatment.id,
        patient_id,
        dentista_id: finalDentistaId,
        valor_total,
      },
    });

    return NextResponse.json(
      {
        message: 'Tratamento criado com sucesso',
        treatment,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar tratamento:', error);

    const errorProtocol = Math.floor(10000 + Math.random() * 90000);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        protocol: errorProtocol,
      },
      { status: 500 }
    );
  }
}

// GET /api/treatments - Listar tratamentos
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const patientId = searchParams.get('patient_id');

    // Construir filtros
    const where: Record<string, unknown> = {};

    // Dentistas só veem seus próprios tratamentos
    if (userRole === 'dentista' && userId) {
      where.dentista_id = userId;
    }

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patient_id = patientId;
    }

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              nome: true,
            },
          },
          dentista: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.treatment.count({ where }),
    ]);

    return NextResponse.json({
      treatments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Erro ao listar tratamentos:', error);

    const errorProtocol = Math.floor(10000 + Math.random() * 90000);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        protocol: errorProtocol,
      },
      { status: 500 }
    );
  }
}
