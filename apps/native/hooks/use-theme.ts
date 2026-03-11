import type { ThemeMode, UseThemeResult } from '@/types/use-theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'nativewind'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'chatly:theme'

/**
 * useTheme
 *
 * Global design-system hook for Chalty native.
 *
 * Provides:
 * - the user's selected theme mode (`light` | `dark` | `system`)
 * - a helper to update and persist theme preference
 *
 * Tailwind `dark:` classes automatically stay in sync via NativeWind.
 *
 * Use this hook when:
 * - styling navigation headers or inline JS styles
 * - building theme controls (e.g. settings screens)
 *
 * Do NOT use this just to conditionally apply Tailwind classes —
 * NativeWind already handles that automatically.
 */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<ThemeMode>('system')
  const { setColorScheme } = useColorScheme()

  useEffect(() => {
    const isValidTheme = (value: string | null): value is ThemeMode => {
      if (!value) return false
      return (['light', 'dark', 'system'] as string[]).includes(value)
    }

    const hydrate = async () => {
      try {
        const prev = await AsyncStorage.getItem(STORAGE_KEY)

        if (isValidTheme(prev)) {
          setTheme(prev)
          setColorScheme(prev)
        } else {
          setColorScheme(theme)
        }
      } catch (error) {
        console.warn('Theme hydration from async storage failed', error)
      }
    }

    hydrate()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateTheme = async (theme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, theme)
    } catch (error) {
      console.warn('Updating theme in async storage failed', error)
    }
    setTheme(theme)
    setColorScheme(theme)
  }

  return { theme, updateTheme }
}
