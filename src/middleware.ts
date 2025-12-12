// ================================
// EasyCore - Middleware JWT
// Proteção de rotas autenticadas
// ================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, extractTokenFromHeader } from './lib/jwt-edge';

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/api/auth/login',
  '/api/users/register',
  '/api/health',
];

// Rotas que requerem role admin
const adminRoutes = [
  '/api/admin',
  '/api/audit-logs',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rotas que não são API
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar token JWT
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      {
        error: 'Token de autenticação não fornecido',
        code: 'AUTH_TOKEN_MISSING',
      },
      { status: 401 }
    );
  }

  const payload = await verifyTokenEdge(token);

  if (!payload) {
    return NextResponse.json(
      {
        error: 'Token inválido ou expirado',
        code: 'AUTH_TOKEN_INVALID',
      },
      { status: 401 }
    );
  }

  // Verificar role para rotas admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Acesso negado. Requer permissão de administrador.',
          code: 'AUTH_ADMIN_REQUIRED',
        },
        { status: 403 }
      );
    }
  }

  // Adicionar informações do usuário aos headers para uso nas rotas
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/:path*',
};
