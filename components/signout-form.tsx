'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { signout } from '@/app/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' className='cursor-pointer' disabled={pending}>
      {pending ? (
        <>
          <Spinner /> Signing out
        </>
      ) : (
        'Sign out'
      )}
    </Button>
  )
}

export default function SignoutForm() {
  return (
    <form action={signout}>
      <SubmitButton />
    </form>
  )
}
