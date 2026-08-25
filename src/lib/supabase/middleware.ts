import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Updates user auth session on incoming HTTP requests.
 * Applies CSP, HSTS, and rate-limiting security headers and protects `/admin` routes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Apply HTTP Security Headers & CSP
  applySecurityHeaders(supabaseResponse.headers);

  // Apply Rate Limiting on Login Route (max 10 requests per minute per IP)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  if (isAuthRoute) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitResult = rateLimit(`login:${ip}`, { limit: 10, windowSeconds: 60 });

    if (!rateLimitResult.success) {
      return new NextResponse('Too Many Requests. Please wait before retrying login.', {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.resetSeconds),
          'Content-Type': 'text/plain',
        },
      });
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase environment is not configured, pass through (e.g. during initial setup)
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        applySecurityHeaders(supabaseResponse.headers);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Protect /admin routes: redirect unauthenticated users to /login
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    const redirectRes = NextResponse.redirect(url);
    applySecurityHeaders(redirectRes.headers);
    return redirectRes;
  }

  // Redirect authenticated users away from /login to /admin
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    const redirectRes = NextResponse.redirect(url);
    applySecurityHeaders(redirectRes.headers);
    return redirectRes;
  }

  return supabaseResponse;
}
