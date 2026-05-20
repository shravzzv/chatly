'use client'

import { useChatlyStore } from '@/providers/chatly-store-provider'
import { createClient } from '@/utils/supabase/client'
import { AlertCircleIcon, BadgeCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

export default function AccountEmailStatus() {
  const user = useChatlyStore((state) => state.user)
  const newEmail = user?.new_email

  const handleSendConfirmation = async () => {
    if (!newEmail) return
    const supabase = createClient()
    const emailRedirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/account`

    const { error } = await supabase.auth.resend({
      type: 'email_change',
      email: newEmail,
      options: { emailRedirectTo },
    })

    if (error) {
      console.error(error)
      toast.error('Failed to send email confirmation')
      return
    }

    toast.success('Email confirmation sent. Check your inbox.')
  }

  if (!user) return null

  if (!newEmail) {
    return (
      <Alert className='border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'>
        <BadgeCheck className='text-emerald-600' />

        <AlertTitle>Email verified</AlertTitle>
        <AlertDescription>
          <p className='text-primary'>
            Your email <span className='font-bold'>{user.email}</span> has been
            confirmed and is active.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50'>
      <AlertCircleIcon />
      <AlertTitle>Confirm your new email</AlertTitle>
      <AlertDescription>
        <p>
          We&apos;ve sent a confirmation link to{' '}
          <strong>{user.new_email}</strong>.
        </p>

        <p>
          Until it&apos;s confirmed, your current email{' '}
          <strong>{user.email}</strong> will continue to be used.
        </p>

        <Button
          variant='outline'
          size='sm'
          onClick={handleSendConfirmation}
          className='mt-2 cursor-pointer'
        >
          Resend confirmation email
        </Button>
      </AlertDescription>
    </Alert>
  )
}
