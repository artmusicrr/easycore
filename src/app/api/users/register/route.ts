// ================================
// POST /api/users/register
// Registro de novos usuários
// ================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

// Schema de validação
const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  role: z.enum(['recepcao', 'dentista', 'admin']).optional().default('recepcao'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { nome, email, senha, role } = validation.data;
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }
    
    // Hash da senha com bcrypt (cost factor 12)
    const senha_hash = await bcrypt.hash(senha, 12);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha_hash,
        role,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
    
    // Registrar auditoria
    await createAuditLog({
      userId: user.id,
      acao: AUDIT_ACTIONS.USER_CREATED,
      detalhes: {
        email: user.email,
        role: user.role,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });
    
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    
    // Gerar protocolo de erro
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
