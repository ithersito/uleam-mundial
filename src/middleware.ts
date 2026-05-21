import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, SESSION_COOKIE_NAME } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener la cookie de sesión
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const token = sessionCookie?.value;

  // Verificar la sesión
  const user = token ? await verifyJWT(token) : null;

  // Definir tipos de rutas
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // Caso 1: Ruta protegida y el usuario no está autenticado
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Caso 1b: Admin intenta entrar al dashboard → redirigir a /admin
  if (isProtectedRoute && user?.esAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Caso 2: Ruta admin — requiere autenticación y rol admin
  if (isAdminRoute) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (!user.esAdmin) return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Caso 3: Ruta de login/registro y el usuario ya está autenticado
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continuar normalmente
  return NextResponse.next();
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/admin',
    '/login',
    '/register',
  ],
};
