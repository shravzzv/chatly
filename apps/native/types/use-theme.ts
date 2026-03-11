/**
 * Theme preference selected by the user.
 *
 * - 'light'  → forces light appearance
 * - 'dark'   → forces dark appearance
 * - 'system' → follows OS theme automatically
 */
export type ThemeMode = 'light' | 'dark' | 'system'

export interface UseThemeResult {
  /**
   * Current theme preference selected by the user.
   */
  theme: ThemeMode

  /**
   * Updates the theme preference.
   *
   * Persists automatically and updates NativeWind so
   * `dark:` classes react immediately.
   */
  updateTheme: (theme: ThemeMode) => void
}
