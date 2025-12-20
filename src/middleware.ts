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

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preflight-request
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  // Se não for API, segue normal
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Diagnóstico
  console.log(`[API Request] Method: ${request.method} Path: ${pathname}`);

  // Permitir rotas públicas e injetar CORS na resposta
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Verificar token JWT
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      { error: 'Token não fornecido', code: 'AUTH_TOKEN_MISSING' },
      { status: 401, headers: corsHeaders }
    );
  }

  const payload = await verifyTokenEdge(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Token inválido', code: 'AUTH_TOKEN_INVALID' },
      { status: 401, headers: corsHeaders }
    );
  }

  // Role admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin requerido', code: 'AUTH_ADMIN_REQUIRED' },
        { status: 403, headers: corsHeaders }
      );
    }
  }

  // Injetar headers de usuário e garantir CORS na resposta final
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Aplicar CORS em todas as respostas de API (inclusive sucessos/erros das rotas)
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
