'use client'

import { SignupForm } from '@/components/signup-form'

export default function Page() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-8'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <SignupForm />
      </div>
    </div>
  )
}
