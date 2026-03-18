// lib/auth.ts
import { supabase } from '@/lib/supabase'

export async function handleAuthRedirect(url: string) {
  if (!url) return
  if (!supabase) return

  const hash = url.split('#')[1]
  if (!hash) return

  const params = new URLSearchParams(hash)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (!access_token || !refresh_token) return

  await supabase.auth.setSession({
    access_token,
    refresh_token,
  })
}
