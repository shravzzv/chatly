'use client'

import { useChatlyStore } from '@/providers/chatly-store-provider'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircleIcon } from 'lucide-react'

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
      <p className='text-sm text-emerald-600 font-medium'>
        Your email <strong>{user.email}</strong> is verified and active.
      </p>
    )
  }

  return (
    <Alert>
      <AlertCircleIcon />
      <AlertTitle>Confirm your new email</AlertTitle>
      <AlertDescription className='space-y-2'>
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
