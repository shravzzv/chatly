import { useTheme } from '@/hooks/use-theme'
import type { UseThemeResult } from '@/types/use-theme'
import React, { createContext, useContext } from 'react'

const ThemeContext = createContext<UseThemeResult | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * Provides global theme state for Still.
 *
 * Wrap this around your app root so any component can access
 * theme tokens via `useThemeContext`.
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  return <ThemeContext value={{ ...useTheme() }}>{children}</ThemeContext>
}

/**
 * Consumer hook for accessing global theme state.
 *
 * @throws if used outside `ThemeProvider` to prevent silent bugs.
 */
export const useThemeContext = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw Error(`useThemeContext must be used within ThemeProvider`)
  return ctx
}
