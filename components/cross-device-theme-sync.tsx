'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useChatlyStore } from '@/providers/chatly-store-provider'

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
  const profileTheme = useChatlyStore((s) => s.profile?.theme)
  const { theme: currentTheme, setTheme } = useTheme()

  useEffect(() => {
    if (!profileTheme) return
    if (profileTheme === currentTheme) return

    setTheme(profileTheme)
  }, [profileTheme, currentTheme, setTheme])

  return null
}
