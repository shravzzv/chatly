// apps/native/types/use-auth.ts
/**
 * Result returned by {@link useAuth} and exposed via {@link useAuthContext}.
 *
 * This interface intentionally exposes a minimal surface area so that
 * authentication state can be consumed easily in route guards and layout
 * components without leaking Supabase implementation details.
 */
export interface UseAuthResult {
  /**
   * Indicates whether the current user is authenticated.
   *
   * This value is derived from the presence of a valid Supabase session and
   * automatically updates whenever the authentication state changes
   * (e.g. sign-in, sign-out, token refresh).
   */
  isAuthenticated: boolean
}
