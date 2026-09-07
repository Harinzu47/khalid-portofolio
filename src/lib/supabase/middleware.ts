import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { applySecurityHeaders, validateSafeRedirectUrl } from '@/lib/security';
import { isOwnerUser } from '@/lib/owner-policy';

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

  // Login attempts are limited in the server action, including direct POSTs.
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');

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

  const isPrivateConsoleRoute =
    request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/os') ||
    request.nextUrl.pathname.startsWith('/api/admin');

  if (isPrivateConsoleRoute && user && !isOwnerUser(user)) {
    const denied = new NextResponse('Forbidden', { status: 403 });
    applySecurityHeaders(denied.headers);
    return denied;
  }

  // Protect /admin and /os routes: redirect unauthenticated users to /login
  if (isPrivateConsoleRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    const redirectRes = NextResponse.redirect(url);
    applySecurityHeaders(redirectRes.headers);
    return redirectRes;
  }

  // Redirect authenticated users away from /login to target or /os
  if (isAuthRoute && isOwnerUser(user)) {
    const rawTarget = request.nextUrl.searchParams.get('redirect');
    const safeTarget = validateSafeRedirectUrl(rawTarget, '/os');
    const url = request.nextUrl.clone();
    url.pathname = safeTarget;
    url.searchParams.delete('redirect');
    const redirectRes = NextResponse.redirect(url);
    applySecurityHeaders(redirectRes.headers);
    return redirectRes;
  }

  return supabaseResponse;
}
