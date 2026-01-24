'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { type Profile } from '@/types/profile'
import { type PostgrestError } from '@supabase/supabase-js'

/**
 * Return shape of the `useProfiles` hook.
 *
 * Separates:
 * - the full authoritative profile list
 * - a filtered, view-ready subset derived from search input
 *
 * This allows consumers to:
 * - render the full list when needed
 * - avoid reimplementing filtering logic in UI components
 */
interface UseProfilesReturnType {
  /**
   * The full list of profiles fetched from the database.
   *
   * This is the authoritative source of truth and is never mutated
   * by search or UI-specific concerns.
   */
  profiles: Profile[]

  /**
   * A derived subset of `profiles`, filtered using the provided
   * `searchQuery`.
   *
   * This value is memoized and safe to use directly in render logic.
   */
  filteredProfiles: Profile[]

  /**
   * Indicates whether the initial profile fetch is in progress.
   */
  loading: boolean

  /**
   * The last error encountered while fetching profiles, if any.
   *
   * This represents a *data-layer failure*, not a validation error.
   */
  error: PostgrestError | null
}

/**
 * useProfiles
 *
 * Fetches and manages the list of user profiles, along with a
 * memoized, search-filtered view of that list.
 *
 * Responsibilities:
 * - Fetch profiles once on mount
 * - Expose loading and error state
 * - Provide a filtered view based on `searchQuery`
 *
 * Non-responsibilities:
 * - Does not own search input state
 * - Does not perform pagination or realtime updates
 *
 * @param searchQuery
 * A case-insensitive search string used to filter profiles by
 * name or username.
 */
export function useProfiles(searchQuery: string): UseProfilesReturnType {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

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
        toast.error('Failed to load profiles')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

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
