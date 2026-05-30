import useNetwork from '@/hooks/use-network'
import { UseNetworkResult } from '@/types/use-network'
import { createContext, useContext } from 'react'

const NetworkContext = createContext<UseNetworkResult | null>(null)

interface NetworkProviderProps {
  children: React.ReactNode
}

/**
 * Provides application-wide network connectivity state.
 *
 * This provider subscribes to platform-specific network events and
 * exposes the resulting state through React context. It should be
 * mounted near the root of the application so any component can
 * access network status via `useNetworkContext`.
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
