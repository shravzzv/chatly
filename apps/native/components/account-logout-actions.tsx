import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Spinner } from './ui/spinner'
import { Text } from './ui/text'

export default function AccountLogoutActions() {
  const [loggingOut, setLoggingOut] = useState<
    'local' | 'global' | 'others' | null
  >(null)

  const handleLogout = async (scope: 'local' | 'global' | 'others') => {
    if (!supabase) return
    setLoggingOut(scope)

    const { error } = await supabase.auth.signOut({ scope })

    if (error) {
      console.error('Failed to sign out', error)
      return
    }

    if (scope !== 'others') {
      router.replace('/signin')
      toast.success('Signed out')
    } else {
      toast.success('Signed out elsewhere')
      setLoggingOut(null)
    }
  }

  return (
    <View className='flex-row gap-2'>
      <Button
        onPress={() => handleLogout('local')}
        className='w-fit'
        disabled={loggingOut !== null}
      >
        {loggingOut === 'local' ? (
          <>
            <Text>Logging out</Text>
            <Spinner className='text-primary-foreground' />
          </>
        ) : (
          <Text>Log out</Text>
        )}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className='w-fit'
            variant='outline'
            disabled={loggingOut !== null}
          >
            <Text>Log out of all sessions</Text>
          </Button>
        </DialogTrigger>

        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Log out of all sessions?</DialogTitle>
            <DialogDescription>
              This will sign you out everywhere, including this session.
            </DialogDescription>
          </DialogHeader>

          <Text className='text-sm text-muted-foreground'>
            Prefer to stay signed in here? You can log out of all other sessions
            instead.
          </Text>

          <Button
            className='w-max cursor-pointer'
            variant='secondary'
            size='sm'
            onPress={() => handleLogout('others')}
            disabled={loggingOut !== null}
          >
            {loggingOut === 'others' ? (
              <>
                <Text>Logging out of all other sessions</Text>
                <Spinner className='text-primary' />
              </>
            ) : (
              <Text>Log out of all other sessions</Text>
            )}
          </Button>

          <DialogFooter>
            <DialogClose className='cursor-pointer' asChild>
              <Button variant='outline' disabled={loggingOut !== null}>
                <Text>Cancel</Text>
              </Button>
            </DialogClose>

            <Button
              className='cursor-pointer'
              onPress={() => handleLogout('global')}
              disabled={loggingOut !== null}
            >
              {loggingOut === 'global' ? (
                <>
                  <Text>Logging out</Text>
                  <Spinner className='text-primary-foreground' />
                </>
              ) : (
                <Text>Continue</Text>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  )
}
