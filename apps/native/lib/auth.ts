// lib/auth.ts
import { supabase } from '@/lib/supabase'

/**
 * ?
 *
 * @param url - ?
 */
export async function handleAuthRedirect(url: string) {
  if (!url || !supabase) return

  // support both hash (#) and query (?)
  const queryString = url.split('#')[1] ?? url.split('?')[1]
  if (!queryString) return

  const params = new URLSearchParams(queryString)
  console.log(params)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (!access_token || !refresh_token) return

  await supabase.auth.setSession({
    access_token,
    refresh_token,
  })
}
