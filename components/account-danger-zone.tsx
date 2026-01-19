'use client'

import { deleteUser, getSubscriptions } from '@/app/actions'
import { Button } from './ui/button'
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
} from '@/components/ui/alert-dialog'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { useState } from 'react'
import { Spinner } from './ui/spinner'
import { toast } from 'sonner'
import Link from 'next/link'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import { getEffectiveSubscription } from '@/lib/billing'
import { Subscription } from '@/types/subscription'

export default function AccountDangerZone() {
  const user = useChatlyStore((state) => state.user)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [checkingSub, setCheckingSub] = useState(false)
  const [sub, setSub] = useState<Subscription | null>(null)
  const isCancelled = sub?.status === 'cancelled' && sub.ends_at

  const handleDeleteIntent = async () => {
    if (!user) return

    try {
      setCheckingSub(true)
      const subs = await getSubscriptions()
      const effectiveSub = getEffectiveSubscription(subs)

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
    if (!user) return

    try {
      setDeleting(true)
      await deleteUser(user.id)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete your account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <section className='space-y-4 pt-6'>
      <h2 className='text-lg font-semibold text-red-500'>Danger zone</h2>

      <AlertDialog open={showConfirmDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant='destructive'
            className='cursor-pointer'
            onClick={handleDeleteIntent}
            disabled={checkingSub}
          >
            {checkingSub ? (
              <>
                Processing
                <Spinner />
              </>
            ) : (
              'Delete account'
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className='cursor-pointer'
              onClick={() => setShowConfirmDialog(false)}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              className='cursor-pointer'
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  Deleting
                  <Spinner />
                </>
              ) : (
                'Continue'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSubDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCancelled
                ? 'Your subscription is still active'
                : 'You have an active subscription'}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {isCancelled ? (
                <>
                  You&apos;ve cancelled your subscription, but you still have
                  access until{' '}
                  <strong>
                    {new Date(sub.ends_at as string).toLocaleDateString()}
                  </strong>
                  . You can delete your account after access ends.
                </>
              ) : (
                <>
                  Please <span className='font-bold'>cancel</span> your active
                  subscription before deleting your account.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className='cursor-pointer'
              onClick={() => setShowSubDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className='cursor-pointer' asChild>
              <Link href={LS_CUSTOMER_PORTAL_URL}>Manage Billing</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className='text-xs text-muted-foreground'>
        You need to cancel your{' '}
        <Link href='/plan' className='underline'>
          plan
        </Link>{' '}
        if you want to delete your account.
      </p>
    </section>
  )
}
