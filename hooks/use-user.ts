import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User, AuthError } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) setError(error)
        else setUser(user)
      } finally {
        setLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    loadUser()
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, error }
}
