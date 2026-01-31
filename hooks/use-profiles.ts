'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type Profile } from '@/types/profile'
import { type PostgrestError } from '@supabase/supabase-js'
import type { UseProfilesResult } from '@/types/use-profiles'
import { useChatlyStore } from '@/providers/chatly-store-provider'

/**
 * `useProfiles`
 *
 * Fetches and maintains the authoritative list of user profiles,
 * along with a memoized, search-filtered view for rendering.
 *
 * This hook is **read-only** from the consumer’s perspective.
 * It does not expose mutation methods; profile updates are handled
 * elsewhere (e.g. account settings, global store updates).
 *
 * Responsibilities:
 * - Fetch the full profile list on mount
 * - Keep profiles in sync via realtime database events
 * - Expose loading and error state
 * - Provide a derived, search-filtered view of profiles
 *
 * Non-responsibilities:
 * - Does not own search input state
 * - Does not perform pagination
 * - Does not initiate profile mutations
 *
 * Realtime behavior:
 * - INSERT: new profiles are appended automatically
 * - UPDATE: profiles are updated in-place
 *   - If the updated profile belongs to the current user,
 *     global profile state is synchronized
 * - DELETE: removed profiles are pruned from the list
 *
 * @param searchQuery
 * A case-insensitive search string used to filter profiles
 * by `name` or `username`.
 *
 * @returns An object containing the full profile list,
 * a filtered subset, and loading/error state.
 */
export function useProfiles(searchQuery: string): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  const currentUserId = useChatlyStore((state) => state.user)?.id
  const setProfile = useChatlyStore((state) => state.setProfile)

  /**
   * Fetch the full profile list on initial mount.
   *
   * Profiles are ordered by name to provide a stable,
   * user-friendly default ordering.
   */
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)

      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error

        setProfiles(data)
        setError(null)
      } catch (error) {
        setError(error as PostgrestError)
        console.error('Error fetching profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  /**
   * Handle realtime for profiles.
   */
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('profiles:realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        async (payload) => {
          switch (payload.eventType) {
            case 'INSERT': {
              const profile = payload.new as Profile

              setProfiles((prev) => [...prev, profile])
              break
            }

            case 'UPDATE': {
              const updatedProfile = payload.new as Profile

              setProfiles((prev) =>
                prev.map((p) =>
                  p.id === updatedProfile.id ? updatedProfile : p,
                ),
              )

              if (updatedProfile.user_id === currentUserId) {
                setProfile(updatedProfile)
              }
              break
            }

            case 'DELETE': {
              const deletedId = payload.old.id as string

              setProfiles((prev) => prev.filter((p) => p.id !== deletedId))
              break
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, setProfile])

  /**
   * Derive a filtered view of profiles based on `searchQuery`.
   *
   * Matching is:
   * - case-insensitive
   * - performed against both `name` and `username`
   *
   * When `searchQuery` is empty, the full profile list is returned.
   */
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles

    const query = searchQuery.toLowerCase()

    return profiles.filter((p) => {
      const name = p.name?.toLowerCase() || ''
      const username = p.username?.toLowerCase() || ''
      return name.includes(query) || username.includes(query)
    })
  }, [profiles, searchQuery])

  return {
    profiles,
    filteredProfiles,
    loading,
    error,
  }
}
