import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

/**
 * Public routes that do NOT require authentication
 */
const PUBLIC_ROUTES = new Set([
  '/login',
  '/register',
  '/auth/callback',
])

const HOME_ROUTE = '/home'
const ONBOARDING_ROUTE = '/onboarding'

/**
 * Utility: checks if request is for static or asset files
 */
function isAssetRoute(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname)
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for assets (important for performance)
  if (isAssetRoute(pathname)) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request,
  })

  /**
   * Create Supabase client (Edge-safe)
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  /**
   * Always refresh session (required for SSR auth)
   */
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  const isPublicRoute = PUBLIC_ROUTES.has(pathname)

  /**
   * 1. NOT AUTHENTICATED → BLOCK PRIVATE ROUTES
   */
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  /**
   * 2. AUTHENTICATED → BLOCK AUTH PAGES (login/register)
   */
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = HOME_ROUTE
    return NextResponse.redirect(url)
  }

  /**
   * 3. ONBOARDING CHECK (only for logged-in users on app routes)
   */
  if (
    user &&
    !isPublicRoute &&
    pathname !== ONBOARDING_ROUTE
  ) {
    const { data: profile, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    /**
     * Fail-open strategy:
     * If DB fails, don't block user experience
     */
    if (!error && profile && profile.onboarding_completed === false) {
      const url = request.nextUrl.clone()
      url.pathname = ONBOARDING_ROUTE
      return NextResponse.redirect(url)
    }
  }

  /**
   * 4. CONTINUE NORMAL REQUEST
   */
  return response
}

/**
 * Middleware matcher config
 * - Excludes static files & Next internals
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}