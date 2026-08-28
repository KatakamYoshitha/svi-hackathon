import { NextResponse } from 'next/server';

const COOKIE_NAME = 'nhaa_admin_session';

// This runs on the Edge runtime, where the `jsonwebtoken` package (Node
// crypto) cannot run. So middleware only does a cheap "is there a session
// cookie at all" gate to bounce obviously-logged-out visitors early. The
// real signature/role verification happens in Node runtime inside each
// admin server component and every /api/admin/* route (see lib/auth.js).
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isProtectedApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
