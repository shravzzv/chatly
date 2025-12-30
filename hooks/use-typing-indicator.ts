import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from './use-user'

interface TypingState {
  user_id: string
  typing_to: string | null
}

export const useTypingIndicator = (contextUserId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingState>>(
    {}
  )

  const { user } = useUser()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    const channel = supabase.channel('typing-presence', {
      config: {
        presence: { key: user.id },
      },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<TypingState>()
        const typingMap: Record<string, TypingState> = {}

        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.typing_to === user.id) {
              typingMap[presence.user_id] = presence
            }
          })
        })

        setTypingUsers(typingMap)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return

        await channel.track({
          user_id: user.id,
          typing_to: null,
        })
      })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [user])

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!user || !contextUserId) return
    const channel = channelRef.current
    if (!channel) return

    await channel.track({
      user_id: user.id,
      typing_to: isTyping ? contextUserId : null,
    })
  }

  const isTyping: boolean | null = contextUserId
    ? user && typingUsers[contextUserId]?.typing_to === user.id
    : null

  return { isTyping, updateTypingStatus }
}
