import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes for employers
  if (request.nextUrl.pathname.startsWith('/isveren/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/isveren/giris', request.url))
    }

    // Check if user is company
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'company') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected routes for candidates
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/giris', request.url))
    }

    // Check if user is candidate
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'candidate') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected routes for admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/giris', request.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Redirect logged in users away from auth pages
  if (user && (
    request.nextUrl.pathname === '/giris' ||
    request.nextUrl.pathname === '/kayit' ||
    request.nextUrl.pathname === '/isveren/giris' ||
    request.nextUrl.pathname === '/isveren/kayit'
  )) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'company') {
      return NextResponse.redirect(new URL('/isveren/dashboard', request.url))
    } else if (profile?.role === 'candidate') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/isveren/dashboard/:path*',
    '/admin/:path*',
    '/giris',
    '/kayit',
    '/isveren/giris',
    '/isveren/kayit',
  ],
}
