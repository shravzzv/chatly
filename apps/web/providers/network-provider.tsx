'use client'

import useNetwork from '@/hooks/use-network'
import { UseNetworkResult } from '@/types/use-network'
import { createContext, useContext } from 'react'

const NetworkContext = createContext<UseNetworkResult | null>(null)

interface NetworkProviderProps {
  children: React.ReactNode
}

/**
 * Synchronizes browser network state and exposes it globally
 * through React context.
 *
 * This provider should be mounted near the root of the app so
 * any component can access connectivity state via
 * `useNetworkContext`.
 */
export function NetworkProvider({ children }: NetworkProviderProps) {
  return <NetworkContext value={{ ...useNetwork() }}>{children}</NetworkContext>
}

/**
 * Consumer hook for accessing global network state.
 *
 * @throws if used outside `NetworkProvider` to prevent silent bugs.
 */
export function useNetworkContext() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw Error('useNetwork must be used inside NetworkProvider')
  return ctx
}
