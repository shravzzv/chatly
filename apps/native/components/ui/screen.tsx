// apps/native/components/ui/screen.tsx
import { cn } from '@/lib/utils'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ScreenProps {
  children: React.ReactNode
  className?: string
}

/**
 * Screen
 *
 * Base layout wrapper for Chatly's screens.
 *
 * Responsibilities:
 * - applies safe-area padding
 * - sets surface background
 * - provides consistent page padding + flex layout
 *
 * Prefer this over manually composing `SafeAreaView` + `View`
 * in each route file.
 */
export function Screen({ children, className }: ScreenProps) {
  return (
    <SafeAreaView className='bg-surface flex-1'>
      <View className={cn('flex-1 px-8 py-0 md:py-8', className)}>
        {children}
      </View>
    </SafeAreaView>
  )
}
