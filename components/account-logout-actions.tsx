'use client'

import { Button } from './ui/button'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { useState } from 'react'
import { Spinner } from './ui/spinner'
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

export default function AccountLogoutActions() {
  const logout = useChatlyStore((state) => state.logout)
  const [loggingOut, setLoggingOut] = useState<
    'local' | 'global' | 'others' | null
  >(null)

  const handleLocalLogout = async () => {
    setLoggingOut('local')
    await logout('local')
  }

  const handleGlobalLogout = async () => {
    setLoggingOut('global')
    await logout('global')
  }

  const handleOtherLogout = async () => {
    setLoggingOut('others')
    await logout('others')
    setLoggingOut(null)
  }

  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
      <Button
        disabled={loggingOut !== null}
        onClick={handleLocalLogout}
        className='cursor-pointer'
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
            className='cursor-pointer'
            disabled={loggingOut !== null}
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

          <p className='text-sm text-muted-foreground'>
            Prefer to stay signed in here? You can log out of all other sessions
            instead.
          </p>

          <Button
            onClick={handleOtherLogout}
            className='cursor-pointer w-max'
            variant='secondary'
            size='sm'
            disabled={loggingOut !== null}
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
              className='cursor-pointer'
              onClick={handleGlobalLogout}
              disabled={loggingOut !== null}
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
