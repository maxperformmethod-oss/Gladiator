import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/** Supabase klient pre serverový kód. Session drží v HTTP-only cookies. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component nesmie zapisovať cookies.
            // Obnovu session rieši middleware — doplní sa v G2.
          }
        },
      },
    }
  )
}
