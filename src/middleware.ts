import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const publicRoutes = [
  '/auth/sign-in',
  '/unauthorized',
  '/account-manager/partners',
  '/account-manager/applications/550e8400-e29b-41d4-a716-446655440000',
  '/account-manager/applications',
  '/partner/applications/550e8400-e29b-41d4-a716-446655440000',
  '/partner/applications',
  '/account-manager/notifications',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get('token')?.value
  if (!token) {

    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role: 'AccountManager' | 'Partner'
    }


    if (pathname.startsWith('/account-manager')) {
      if (decoded.role !== 'AccountManager') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    if (pathname.startsWith('/partner')) {
      if (decoded.role !== 'Partner') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  } catch (err) {
    console.error('JWT error:', err)
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
