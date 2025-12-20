import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/patients', '/treatments', '/payments', '/admin']

// Rotas que não podem ser acessadas se já estiver logado
const publicOnlyRoutes = ['/login']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('easycore.token')?.value
  const { pathname } = request.nextUrl

  // 1. Se for rota protegida e não tiver token, vai para login
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = new URL('/login', request.url)
      // Salvar a URL original para redirecionar de volta após o login
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
