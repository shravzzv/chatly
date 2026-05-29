import { useNetworkContext } from '@/providers/network-provider'
import { WifiOff } from 'lucide-react-native'
import { View } from 'react-native'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface NetworkShellProps {
  children: React.ReactNode
}

/**
 * Provides lightweight global network feedback around the app.
 *
 * This shell renders its children normally and conditionally
 * displays persistent offline UI when device connectivity is lost.
 *
 * The goal is to communicate degraded functionality without
 * interrupting the user with dialogs or transient toasts.
 *
 * This component should typically be mounted near the root of
 * the application so offline state remains visible regardless
 * of the current screen.
 */
export default function NetworkShell({ children }: NetworkShellProps) {
  const { isOnline } = useNetworkContext()

  return (
    <>
      {children}

      {!isOnline && (
        <View className='absolute bottom-0 left-0 right-0 z-50 flex-row items-center justify-center gap-1 border-t border-amber-200 bg-amber-50 px-6 py-2 dark:border-amber-900 dark:bg-amber-950'>
          <Icon
            as={WifiOff}
            size={16}
            className='text-amber-900 dark:text-amber-100'
          />

          <Text className='text-center text-sm text-amber-900 dark:text-amber-100'>
            You&apos;re offline. Some functionality may be unavailable.
          </Text>
        </View>
      )}
    </>
  )
}
