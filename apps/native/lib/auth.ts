// lib/auth.ts
import { supabase } from '@/lib/supabase'

/**
 * Extracts auth tokens from a redirect URL and restores the Supabase session.
 *
 * Supports both hash (#) and query (?) based OAuth redirects.
 * No-op if tokens are missing or Supabase is unavailable.
 *
 * @param url - The redirect URL containing auth tokens
 */
export async function handleAuthRedirect(url: string) {
  if (!url || !supabase) return

  // support both hash (#) and query (?)
  const queryString = url.split('#')[1] ?? url.split('?')[1]
  if (!queryString) return

  const params = new URLSearchParams(queryString)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (!access_token || !refresh_token) return

  await supabase.auth.setSession({
    access_token,
    refresh_token,
  })
}
