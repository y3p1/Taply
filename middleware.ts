import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'taply-dev-jwt-secret-key-2024-change-in-prod'
const COOKIE_NAME = 'taply_token'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register']

// API routes that don't require authentication
const publicApiRoutes = ['/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow all other API routes to handle auth themselves
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  // If on a public route and has valid token, redirect to dashboard
  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET)
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL('/', request.url))
      } catch {
        // Token invalid, stay on login page
        return NextResponse.next()
      }
    }
    return NextResponse.next()
  }

  // Protected route — require valid token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
