import { UseNetworkResult } from '@/types/use-network'
import NetInfo from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'

/**
 * Tracks the device's current network connectivity status.
 *
 * The hook subscribes to native network state updates through
 * {@link NetInfo} and keeps connectivity state synchronized for the
 * lifetime of the component.
 *
 * Prefer consuming this state through `useNetworkContext`
 * rather than using this hook directly.
 *
 * @returns Current network connectivity state.
 */
export default function useNetwork(): UseNetworkResult {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected))
    })

    return unsubscribe
  }, [])

  return {
    isOnline,
  }
}
