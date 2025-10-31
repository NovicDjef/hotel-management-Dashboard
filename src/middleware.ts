import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Le middleware est simplifié car l'AuthGuard gère la protection côté client
  // Les tokens sont stockés dans localStorage (côté client uniquement)
  // Le middleware côté serveur ne peut pas accéder à localStorage

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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)',
  ],
};
