// ================================
// POST /api/patients
// Cadastro de pacientes
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { encrypt, isValidCPF } from '@/lib/crypto';

// Schema de validação
const createPatientSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  telefone: z.string().optional(),
  cpf: z.string().refine(isValidCPF, 'CPF inválido'),
  email: z.string().email('Email inválido').optional(),
  consentimento_lgpd: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validar dados
    const validation = createPatientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { nome, telefone, cpf, email, consentimento_lgpd } = validation.data;
    
    // Verificar consentimento LGPD
    if (!consentimento_lgpd) {
      return NextResponse.json(
        { error: 'Consentimento LGPD é obrigatório' },
        { status: 400 }
      );
    }
    
    // Criptografar CPF
    const cpf_encrypted = encrypt(cpf.replace(/\D/g, ''));
    
    // Verificar se CPF já existe
    const existingPatient = await prisma.patient.findUnique({
      where: { cpf_encrypted },
    });
    
    if (existingPatient) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 409 }
      );
    }
    
    // Verificar email duplicado
    if (email) {
      const existingEmail = await prisma.patient.findUnique({
        where: { email },
      });
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        );
      }
    }
    
    // Criar paciente
    const patient = await prisma.patient.create({
      data: {
        nome,
        telefone,
        cpf_encrypted,
        email,
        consentimento_lgpd,
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        consentimento_lgpd: true,
        data_cadastro: true,
      },
    });
    
    // Registrar auditoria
    await createAuditLog({
      userId,
      acao: AUDIT_ACTIONS.PATIENT_CREATED,
      detalhes: {
        patient_id: patient.id,
        nome: patient.nome,
        // Não logar CPF por segurança
      },
    });
    
    return NextResponse.json(
      { 
        message: 'Paciente cadastrado com sucesso',
        patient,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    
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

// GET /api/patients - Listar pacientes
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    
    // Construir filtros
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        select: {
          id: true,
          nome: true,
          telefone: true,
          email: true,
          data_cadastro: true,
          consentimento_lgpd: true,
          _count: {
            select: { treatments: true },
          },
        },
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);
    
    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    
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
