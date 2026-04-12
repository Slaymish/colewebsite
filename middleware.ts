import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from './lib/adminAuth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin/edit and /api/admin routes (except login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const token = request.cookies.get(ADMIN_COOKIE)?.value
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (pathname.startsWith('/admin/edit')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value

    // Allow the login page itself
    if (pathname === '/admin/edit' && !token) {
      return NextResponse.next()
    }

    if (!token || !(await verifySessionToken(token))) {
      const loginUrl = new URL('/admin/edit', request.url)
      if (pathname !== '/admin/edit') {
        loginUrl.searchParams.set('redirect', pathname)
      }
      const response = NextResponse.redirect(loginUrl)
      // Clear invalid cookie
      if (token) {
        response.cookies.delete(ADMIN_COOKIE)
      }
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/edit/:path*', '/api/admin/:path*'],
}
