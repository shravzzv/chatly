import { SignupForm } from '@/components/signup-form'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-8'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
