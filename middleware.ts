import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check for Supabase auth token in cookies
  // Supabase uses project-specific cookie names like: sb-<project-ref>-auth-token
  const cookies = req.cookies.getAll()
  const hasSession = cookies.some(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  )

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/vaults',
    '/heirs',
    '/assets',
    '/will',
    '/notary',
    '/settings',
    '/upgrade',
    '/sign-off',
    '/resources',
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if accessing auth pages with active session
  const authRoutes = ['/login', '/signup', '/register-notary']
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname === route
  )

  if (isAuthRoute && hasSession) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
