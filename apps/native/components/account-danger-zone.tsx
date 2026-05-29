import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/providers/auth-provider'
import { useNetworkContext } from '@/providers/network-provider'
import { getEffectiveSubscription } from '@chatly/lib/billing'
import { LS_CUSTOMER_PORTAL_URL } from '@chatly/lib/data'
import type { Subscription } from '@chatly/types/subscription'
import { Link, router } from 'expo-router'
import { useCallback, useState } from 'react'
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

export default function AccountDangerZone() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [checkingSub, setCheckingSub] = useState(false)
  const [sub, setSub] = useState<Subscription | null>(null)
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isCancelled = sub?.status === 'cancelled' && sub.ends_at
  const { userId } = useAuthContext()
  const { isOnline } = useNetworkContext()

  const getSubscriptions = useCallback(async (): Promise<Subscription[]> => {
    if (!supabase) throw Error('Supabase client absent')

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  }, [userId])

  const handleDeleteIntent = async () => {
    try {
      setCheckingSub(true)
      const subs = await getSubscriptions()
      const effectiveSub = getEffectiveSubscription(subs ?? [])

      if (effectiveSub) {
        setSub(effectiveSub)
        setShowSubDialog(true)
      } else {
        setShowConfirmDialog(true)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to check subscription status.')
    } finally {
      setCheckingSub(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userId || !supabase) return

    try {
      setDeleting(true)

      const { data, error } = await supabase.functions.invoke('delete-account')

      if (error) throw error
      if (!data.success) throw Error(data.message)

      await supabase.auth.signOut({ scope: 'local' })
      router.replace('/signup')
      toast.success('Account deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete your account.')
      setShowConfirmDialog(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <View className='my-4 gap-2'>
      <Text className='font-semibold text-lg text-destructive'>
        Danger zone
      </Text>

      <Dialog open={showConfirmDialog}>
        <DialogTrigger asChild>
          <Button
            variant='destructive'
            className='w-fit cursor-pointer'
            onPress={handleDeleteIntent}
            disabled={!isOnline}
          >
            {checkingSub ? (
              <>
                <Text>Processing</Text>
                <Spinner className='text-primary-foreground' />
              </>
            ) : (
              <Text>Delete account</Text>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                className='cursor-pointer'
                onPress={() => setShowConfirmDialog(false)}
                disabled={deleting}
                variant='outline'
              >
                <Text>Close</Text>
              </Button>
            </DialogClose>

            <Button
              variant='destructive'
              className='cursor-pointer'
              disabled={deleting || !isOnline}
              onPress={handleConfirmDelete}
            >
              {deleting ? (
                <>
                  <Text>Deleting</Text>
                  <Spinner />
                </>
              ) : (
                <Text>Continue</Text>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubDialog} onOpenChange={setShowSubDialog}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {isCancelled
                ? 'Your subscription is still active'
                : 'You have an active subscription'}
            </DialogTitle>

            <DialogDescription>
              {isCancelled ? (
                <Text>
                  You&apos;ve cancelled your subscription, but you still have
                  access until{' '}
                  <Text className='font-bold'>
                    {new Date(sub.ends_at as string).toLocaleDateString()}
                  </Text>
                  . You can delete your account after access ends.
                </Text>
              ) : (
                <Text>
                  Please <Text className='font-bold'>cancel</Text> your active
                  subscription before deleting your account.
                </Text>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose
              className='cursor-pointer'
              onPress={() => setShowSubDialog(false)}
              asChild
            >
              <Button className='cursor-pointer' variant='outline'>
                <Text>Close</Text>
              </Button>
            </DialogClose>

            <Link href={LS_CUSTOMER_PORTAL_URL} asChild>
              <Button className='cursor-pointer'>
                <Text>Manage Billing</Text>
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Text className='text-xs text-muted-foreground'>
        You need to cancel your{' '}
        <Link href='/plan' className='underline'>
          plan
        </Link>{' '}
        if you want to delete your account.
      </Text>
    </View>
  )
}
