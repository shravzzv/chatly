'use client'

import { useNetworkContext } from '@/providers/network-provider'
import { WifiOff } from 'lucide-react'

interface NetworkShellProps {
  children: React.ReactNode
}

/**
 * Provides lightweight global network feedback around the app.
 *
 * This shell renders its children normally and conditionally
 * shows persistent offline UI when browser connectivity is lost.
 *
 * The goal is to communicate degraded functionality without
 * interrupting the user with dialogs or transient toasts.
 */
export default function NetworkShell({ children }: NetworkShellProps) {
  const { isOnline } = useNetworkContext()

  return (
    <>
      {children}

      {!isOnline && (
        <div className='fixed right-0 bottom-0 left-0 z-50 flex w-full items-center justify-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100'>
          <WifiOff size={16} />

          <span>
            You&apos;re offline. Some functionality may be unavailable.
          </span>
        </div>
      )}
    </>
  )
}
