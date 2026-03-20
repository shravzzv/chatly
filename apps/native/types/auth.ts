export type AuthState =
  | { status: 'idle'; provider: null }
  | { status: 'loading'; provider: 'google' | 'github' | 'apple' | 'email' }
