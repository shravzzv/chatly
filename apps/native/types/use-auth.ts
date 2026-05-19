import { type User } from '@supabase/supabase-js'

/**
 * Result returned by {@link useAuth} and exposed via {@link useAuthContext}.
 *
 * This interface intentionally exposes a minimal surface area so that
 * authentication state can be consumed easily in route guards and layout
 * components without leaking Supabase implementation details.
 */
export interface UseAuthResult {
  /**
   * The currently authenticated Supabase user derived from the active session.
   *
   * Returns `null` when the user is signed out or the session
   * has not yet been established.
   */
  user: User | null

  /**
   * The id of the current user.
   *
   * This value is `null` if unauthenticated.
   */
  userId: string | null

  /**
   * Indicates whether the current user is authenticated.
   *
   * This value is derived from the presence of a valid Supabase session and
   * automatically updates whenever the authentication state changes
   * (e.g. sign-in, sign-out, token refresh).
   */
  isAuthenticated: boolean

  /**
   * Indicates whether the initial authentication state is still being resolved.
   *
   * This is `true` during app startup while Supabase retrieves any existing
   * session (e.g. from storage). It becomes `false` once the session is known,
   * regardless of whether the user is authenticated or not.
   */
  isLoading: boolean
}
