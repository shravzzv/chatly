import useAuth from '@/hooks/use-auth'
import { UseAuthResult } from '@/types/use-auth'
import React, { createContext, useContext } from 'react'

const AuthContext = createContext<UseAuthResult | null>(null)

/**
 * Provides global authentication state to the component tree.
 *
 * Wraps the application and exposes the result of {@link useAuth}
 * through React context so that authentication state can be accessed
 * from anywhere in the app.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthContext value={{ ...useAuth() }}>{children}</AuthContext>
}

/**
 * Access the authentication context provided by {@link AuthProvider}.
 *
 * @returns {UseAuthResult} The current authentication state.
 * @throws If called outside an {@link AuthProvider}.
 */
export const useAuthContext = (): UseAuthResult => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw Error(`useAuthContext must be used within AuthProvider`)
  return ctx
}
