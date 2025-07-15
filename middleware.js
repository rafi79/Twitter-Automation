import { NextResponse } from 'next/server';

export function middleware(request) {
  // Security headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Add API-specific security headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    // Rate limiting check (basic)
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
      // Block obvious bots
      return new Response('Access denied', { status: 403 });
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
