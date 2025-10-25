'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  return (
    <div className='min-h-svh flex flex-col items-center justify-center p-6 bg-muted'>
      <div className='w-full max-w-md space-y-6 text-center'>
        <Alert variant='destructive' className='text-left'>
          <AlertCircle className='h-5 w-5' />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            We couldn&apos;t complete your authentication request. This might be
            due to an invalid link, expired session, or a temporary issue.
          </AlertDescription>
        </Alert>

        <div className='flex flex-col sm:flex-row gap-3 justify-center mt-4'>
          <Button asChild variant='default' className='w-full sm:w-auto'>
            <Link href='/signin'>Go to Sign In</Link>
          </Button>
          <Button asChild variant='outline' className='w-full sm:w-auto'>
            <Link href='/signup'>Create a New Account</Link>
          </Button>
        </div>

        <p className='text-sm text-muted-foreground mt-4'>
          Still having trouble? Try contacting support or come back later.
        </p>
      </div>
    </div>
  )
}
