import { UseNetworkResult } from '@/types/use-network'
import { useEffect, useState } from 'react'

/**
 * Tracks the browser's current network connectivity status.
 *
 * The hook hydrates from `navigator.onLine` and stays synchronized
 * with browser connectivity changes for lightweight UX handling,
 * such as showing offline banners or disabling network-dependent UI.
 *
 * Do not use this hook directly. Prefer using `useNetworkContext`
 * from where this is being provided.
 *
 * @returns Current browser network state.
 */
export default function useNetwork(): UseNetworkResult {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const hydrate = () => setIsOnline(navigator.onLine)

    hydrate()
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}
