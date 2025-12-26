import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge, extractTokenFromHeader } from './src/lib/jwt-edge'

// Rotas que requerem autenticação no frontend (Cookies)
const protectedFrontendRoutes = ['/dashboard', '/patients', '/treatments', '/payments', '/admin']

// Rotas que não podem ser acessadas se já estiver logado (Cookies)
const publicOnlyRoutes = ['/login']

// Rotas de API que não requerem token
const publicApiRoutes = [
  '/api/auth/login',
  '/api/users/register',
  '/api/health',
]

// Rotas de API que requerem role admin
const adminApiRoutes = [
  '/api/admin',
  '/api/audit-logs',
]

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- LOGICA DE API (/api/...) ---
  if (pathname.startsWith('/api')) {
    // 1. Preflight-request
    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, { headers: corsHeaders })
    }

    // 2. Permitir rotas públicas
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next()
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // 3. Verificar token JWT (Header ou Cookie fallback)
    const authHeader = request.headers.get('Authorization')
    let token = extractTokenFromHeader(authHeader)
    
    // Fallback para cookie se não houver header (chamadas do navegador)
    if (!token) {
      token = request.cookies.get('easycore.token')?.value
    }

    if (!token) {
      console.log(`[Middleware] Blocked API request (No token): ${pathname}`)
      return NextResponse.json(
        { error: 'Token não fornecido', code: 'AUTH_TOKEN_MISSING' },
        { status: 401, headers: corsHeaders }
      )
    }

    const payload = await verifyTokenEdge(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido', code: 'AUTH_TOKEN_INVALID' },
        { status: 401, headers: corsHeaders }
      )
    }

    // 4. Verificar role admin para certas rotas de API
    if (adminApiRoutes.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin requerido', code: 'AUTH_ADMIN_REQUIRED' },
          { status: 403, headers: corsHeaders }
        )
      }
    }

    // 5. Injetar headers de usuário e garantir CORS
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-role', payload.role)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  // --- LOGICA DE FRONTEND (Cookies) ---
  const token = request.cookies.get('easycore.token')?.value

  // 1. Se for rota protegida e não tiver token, vai para login
  if (protectedFrontendRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // 2. Se for rota apenas pública (login) e tiver token, vai para dashboard
  if (publicOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
}
