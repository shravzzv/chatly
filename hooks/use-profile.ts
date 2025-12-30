import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/profile'
import { PostgrestError } from '@supabase/supabase-js'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) setError(error)
      else setProfile(data)

      setLoading(false)
    }

    load()
  }, [userId])

  return { profile, loading, error }
}
