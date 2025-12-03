import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, AuthError } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) setError(error)
      else setUser(user)

      setLoading(false)
    }

    load()
  }, [])

  return { user, loading, error }
}
