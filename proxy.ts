import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './lib/supabase'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.pathname

  // 1. Proteksi Login & Register
  if (url === '/login' || url === '/register') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      
      // FIX: Pakai pengecekan aman agar tidak 'never'
      const userPlan = profile ? (profile as { plan: string | null }).plan : null
      const target = userPlan === 'admin' ? '/admin-panel' : '/dashboard'
      
      return NextResponse.redirect(new URL(target, request.url))
    }
    return response
  }

  // 2. Proteksi Belum Login
  if (!user && (url.startsWith('/dashboard') || url.startsWith('/admin-panel'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Proteksi Khusus Admin Panel
  if (user && url.startsWith('/admin-panel')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    

    const userPlan = profile ? (profile as { plan: string | null }).plan : null
    // 4. kalo bukan admin masukin dashboard 
    if (userPlan !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}