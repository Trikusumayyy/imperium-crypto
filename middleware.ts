import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.pathname

  // JANGAN REDIRECT JIKA SUDAH DI LOGIN/REGISTER
  if (url === '/login' || url === '/register') {
    if (user) {
      // Ambil profile untuk menentukan arah balik
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      return NextResponse.redirect(new URL(profile?.plan === 'admin' ? '/admin-panel' : '/dashboard', request.url))
    }
    return response
  }

  // PROTEKSI DASHBOARD & ADMIN
  if (!user && (url.startsWith('/dashboard') || url.startsWith('/admin-panel'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  // Pastikan matcher mengecualikan semua file statis dan favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}