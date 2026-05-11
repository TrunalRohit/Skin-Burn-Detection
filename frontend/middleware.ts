import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeTokenPayload(token: string) {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token from request data available to middleware.
  const token =
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const payload = token ? decodeTokenPayload(token) : null;
  const isVerified = payload?.email_verified === true;
  const isAuthenticated = !!token && isVerified;

  // Protected routes that require authentication
  const protectedRoutes = ['/app', '/history'];
  
  // Public routes that authenticated users should not access
  const publicOnlyRoutes = ['/auth'];

  // Check if accessing protected route without auth
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to auth page if not authenticated
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // Check if accessing public-only route while authenticated
  if (publicOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect to app if already authenticated
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/app/:path*',
    '/history/:path*',
    '/auth/:path*',
  ],
};
