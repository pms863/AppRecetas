import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  
  // Rutas que requieren autenticación
  const protectedPaths = ['/profile', '/favorites'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Obtener la sesión de las cookies
  const session = request.cookies.get('session');

  // Solo redirigir si intenta acceder a rutas protegidas sin sesión
  if (isProtectedPath && !session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};