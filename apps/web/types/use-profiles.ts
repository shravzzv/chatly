import { type PostgrestError } from '@supabase/supabase-js'
import { type Profile } from './profile'

/**
 * Public return shape of the `useProfiles` hook.
 *
 * This API intentionally separates:
 * - `profiles`: the authoritative, unfiltered dataset
 * - `filteredProfiles`: a derived, UI-ready subset
 *
 * Consumers should:
 * - Treat `profiles` as source-of-truth data
 * - Use `filteredProfiles` directly for rendering lists
 * - Avoid reimplementing filtering logic in components
 */
export interface UseProfilesResult {
  /**
   * The complete list of profiles fetched from the database.
   *
   * This array represents the authoritative dataset and is
   * kept in sync via realtime updates.
   *
   * It is not affected by search input or UI-level filtering.
   */
  profiles: Profile[]

  /**
   * A derived subset of `profiles`, filtered using the provided
   * `searchQuery`.
   *
   * This value is memoized and safe to use directly in render logic
   * (e.g. profile lists, search results).
   */
  filteredProfiles: Profile[]

  /**
   * Indicates whether the initial profile fetch is in progress.
   *
   * This flag only represents the loading state of the initial
   * fetch, not realtime updates.
   */
  loading: boolean

  /**
   * The last error encountered while fetching profiles, if any.
   *
   * This represents a data-layer or network failure, not
   * validation or user input errors.
   */
  error: PostgrestError | null
}
