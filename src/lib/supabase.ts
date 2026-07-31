import { createBrowserClient } from '@supabase/ssr'

/** Supabase klient pre kód bežiaci v prehliadači. Používa iba verejný anon kľúč. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
