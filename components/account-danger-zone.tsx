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

export default function AccountDangerZone() {
  const user = useChatlyStore((state) => state.user)
  const [deleting, setDeleting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [checkingSub, setCheckingSub] = useState(false)

  const handleDeleteIntent = async () => {
    if (!user) return
    try {
      setCheckingSub(true)
      const subs = await getSubscriptions()
      const effectiveSub = getEffectiveSubscription(subs)

      if (effectiveSub) setShowSubDialog(true)
      else setShowDialog(true)
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

      <AlertDialog open={showDialog}>
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
              onClick={() => setShowDialog(false)}
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
            <AlertDialogTitle>You have an active subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Please <strong>cancel</strong> your active subscription before
              deleting your account.
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
