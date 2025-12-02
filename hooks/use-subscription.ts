import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Subscription } from '@/types/subscription'

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      setSubscription(data)
      setLoading(false)
    }

    load()
  }, [userId])

  return { subscription, loading }
}
