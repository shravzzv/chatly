'use client'

import { useChatlyStore } from '@/providers/chatly-store-provider'
import { useNetworkContext } from '@/providers/network-provider'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

export default function AccountLogoutActions() {
  const logout = useChatlyStore((state) => state.logout)
  const [loggingOut, setLoggingOut] = useState<
    'local' | 'global' | 'others' | null
  >(null)
  const { isOnline } = useNetworkContext()

  const handleLocalLogout = () => {
    setLoggingOut('local')
    logout('local')
  }

  const handleGlobalLogout = () => {
    setLoggingOut('global')
    logout('global')
  }

  const handleOtherLogout = async () => {
    setLoggingOut('others')
    await logout('others')
    setLoggingOut(null)
  }

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
      <Button
        disabled={loggingOut !== null || !isOnline}
        onClick={handleLocalLogout}
        className='cursor-pointer disabled:cursor-not-allowed'
      >
        {loggingOut === 'local' ? (
          <>
            Logging out
            <Spinner />
          </>
        ) : (
          'Log out'
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant='outline'
            className='cursor-pointer disabled:cursor-not-allowed'
            disabled={loggingOut !== null || !isOnline}
          >
            Log out of all sessions
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of all sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out everywhere, including this session.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <p className='text-muted-foreground text-sm'>
            Prefer to stay signed in here? You can log out of all other sessions
            instead.
          </p>

          <Button
            onClick={handleOtherLogout}
            className='w-max cursor-pointer disabled:cursor-not-allowed'
            variant='secondary'
            size='sm'
            disabled={loggingOut !== null || !isOnline}
            type='button'
          >
            {loggingOut === 'others' ? (
              <>
                Logging out of all other sessions
                <Spinner />
              </>
            ) : (
              'Log out of all other sessions'
            )}
          </Button>

          <AlertDialogFooter>
            <AlertDialogCancel
              className='cursor-pointer'
              disabled={loggingOut !== null}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className='cursor-pointer disabled:cursor-not-allowed'
              onClick={handleGlobalLogout}
              disabled={loggingOut !== null || !isOnline}
            >
              {loggingOut === 'global' ? (
                <>
                  Logging out
                  <Spinner />
                </>
              ) : (
                'Continue'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
