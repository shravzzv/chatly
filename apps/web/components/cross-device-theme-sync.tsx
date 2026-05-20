'use client'

import { usePrivateContext } from '@/providers/private-provider'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

/**
 * CrossDeviceThemeSync
 *
 * Bridges persisted profile theme changes (from realtime or hydration)
 * into next-themes.
 *
 * This does NOT manage theme state.
 * It only reacts to authoritative profile updates.
 */
export function CrossDeviceThemeSync() {
  const { profile } = usePrivateContext()
  const profileTheme = profile?.theme
  const { theme: currentTheme, setTheme } = useTheme()

  useEffect(() => {
    if (!profileTheme) return
    if (profileTheme === currentTheme) return

    setTheme(profileTheme)
  }, [profileTheme, currentTheme, setTheme])

  return null
}
