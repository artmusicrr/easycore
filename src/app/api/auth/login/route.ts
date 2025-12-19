// ================================
// POST /api/auth/login
// Autenticação de usuários
// ================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
  two_factor_code: z.string().optional(),
});

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler OPTIONS para CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { email, senha, two_factor_code } = validation.data;
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    
    if (!senhaValida) {
      // Registrar tentativa falha
      await createAuditLog({
        userId: user.id,
        acao: AUDIT_ACTIONS.USER_LOGIN_FAILED,
        detalhes: {
          email,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          reason: 'invalid_password',
        },
      });
      
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // Verificar 2FA para administradores
    if (user.role === 'admin' && user.two_factor_enabled) {
      if (!two_factor_code) {
        return NextResponse.json(
          { 
            error: 'Código 2FA necessário',
            requires_2fa: true,
          },
          { status: 403, headers: corsHeaders }
        );
      }
      
      // TODO: Implementar validação do código 2FA
      // Por enquanto, apenas placeholder
      // const isValid2FA = verify2FACode(user.two_factor_secret, two_factor_code);
    }
    
    // Gerar token JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Registrar login
    await createAuditLog({
      userId: user.id,
      acao: AUDIT_ACTIONS.USER_LOGIN,
      detalhes: {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });
    
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Erro no login:', error);
    
    const errorProtocol = Math.floor(10000 + Math.random() * 90000);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        protocol: errorProtocol,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
