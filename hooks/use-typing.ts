'use client'

import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import type { TypingState, UseTypingResult } from '@/types/use-typing'

/**
 * useTyping
 *
 * A hook that manages **typing indicators** using Supabase Realtime Presence.
 *
 * Mental model:
 * - Typing is **ephemeral UI state**, not persisted data
 * - Presence is the source of truth
 * - Each user advertises *who they are typing to*
 * - Consumers only care whether the *other user* is typing *to them*
 *
 * This hook answers one core question:
 * > "Is the user I’m chatting with currently typing to me?"
 *
 * @param partnerId
 * The id of the *other participant* in the current chat context.
 *
 * In a 1-to-1 chat:
 * - this is the partner’s user id
 *
 * In other words:
 * - `currentUserId` → "me"
 * - `partnerId` → "the person I’m talking to right now"
 */
export const useTyping = (partnerId: string | null): UseTypingResult => {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingState>>(
    {},
  )
  const currentUserId = useChatlyStore((state) => state.user)?.id
  const channelRef = useRef<RealtimeChannel | null>(null)

  /**
   * Establishes and manages the Supabase Presence channel.
   *
   * Responsibilities:
   * - Join the presence channel using the current user id as the key
   * - Listen for presence `sync` events
   * - Derive which users are currently typing *to this user*
   * - Clean up the channel on unmount or user change
   *
   * Important invariants:
   * - This effect never writes to the database
   * - Presence state is treated as authoritative
   * - Local state is always derived, never mutated incrementally
   */
  useEffect(() => {
    if (!currentUserId) return
    const supabase = createClient()

    const channel = supabase.channel('typing-presence', {
      config: {
        presence: { key: currentUserId },
      },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<TypingState>()
        const typingMap: Record<string, TypingState> = {}

        /**
         * Rebuild typing state from scratch on every sync.
         *
         * This avoids edge cases with partial joins/leaves and
         * guarantees consistency across devices and tabs.
         */
        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.typing_to === currentUserId) {
              typingMap[presence.user_id] = presence
            }
          })
        })

        setTypingUsers(typingMap)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return

        await channel.track({
          user_id: currentUserId,
          typing_to: null,
        })
      })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [currentUserId])

  /**
   * Updates the local user's typing status.
   *
   * This method is intended to be called from input handlers
   * (e.g. `onChange`, `onKeyDown`, `onBlur`).
   *
   * Behavior:
   * - When `isTyping` is true, the user advertises they are typing
   *   to `partnerId`
   * - When false, typing is cleared
   *
   * This update:
   * - Is ephemeral
   * - Does not persist
   * - Is broadcast via presence to other connected clients
   */
  const updateTypingStatus = async (isTyping: boolean) => {
    if (!currentUserId || !partnerId) return
    const channel = channelRef.current
    if (!channel) return

    await channel.track({
      user_id: currentUserId,
      typing_to: isTyping ? partnerId : null,
    })
  }

  /**
   * Whether the *chat patner* is currently typing to the local user.
   *
   * This value is:
   * - Always a boolean
   * - Safe to use directly in render logic
   *
   * Example usage:
   * ```tsx
   * {isTyping && <TypingIndicator />}
   * ```
   */
  const isTyping = Boolean(
    partnerId &&
    currentUserId &&
    typingUsers[partnerId]?.typing_to === currentUserId,
  )

  return { isTyping, updateTypingStatus }
}
