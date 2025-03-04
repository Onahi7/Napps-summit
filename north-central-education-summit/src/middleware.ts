import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const ROLE_ROUTES = {
  admin: ['/admin'],
  validator: ['/validator'],
  participant: ['/participant'],
  superadmin: ['/superadmin'],
};

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session }, error } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return res;
  }

  // No session, redirect to login
  if (!session) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based access
  const userRole = session.user?.user_metadata?.role;
  const isAuthorized = Object.entries(ROLE_ROUTES).some(([role, routes]) => {
    if (role === userRole) {
      return routes.some(route => path.startsWith(route));
    }
    return false;
  });

  if (!isAuthorized) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = `/${userRole}/dashboard`;
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/validator/:path*',
    '/participant/:path*',
    '/superadmin/:path*',
    '/auth/callback',
  ],
};
