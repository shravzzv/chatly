// apps/native/hooks/use-auth.ts
import { supabase } from '@/lib/supabase'
import { UseAuthResult } from '@/types/use-auth'
import { type Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

/**
 * React hook that provides reactive authentication state derived from Supabase.
 *
 * Whenever the Supabase session changes (sign-in, sign-out, token refresh, etc.),
 * the internal session state is updated, causing any consuming components to
 * re-render with the latest authentication status.
 *
 * The hook itself does not expose the full session object because most consumers
 * only need a simple boolean for route guards or conditional rendering.
 *
 * Typical usage is through {@link AuthProvider} and {@link useAuthContext},
 * which ensures a single shared subscription across the application.
 *
 * @returns {UseAuthResult} An object describing the current authentication state.
 */
export default function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      },
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return {
    isAuthenticated: !!session,
  }
}
