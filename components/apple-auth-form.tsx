'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { signInWithApple } from '@/app/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      variant='outline'
      type='submit'
      className='cursor-pointer w-full h-10 p-0 flex items-center justify-center'
      // disabled={pending}
      disabled
      title='Continue with Apple'
    >
      {pending ? (
        <Spinner />
      ) : (
        <>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
            <path
              d='M16.365 1.43c0 1.14-.418 2.053-1.255 2.738-.835.684-1.737 1.08-2.705 1.182a2.97 2.97 0 0 1-.028-.367c0-1.084.418-2.013 1.255-2.784C14.474 1.428 15.37 1 16.31 1c.02.142.056.284.056.43zM20.83 17.722c-.333.77-.725 1.496-1.177 2.178-.612.923-1.126 1.562-1.54 1.922-.618.57-1.276.863-1.974.88-.504.01-1.113-.144-1.828-.464-.716-.318-1.376-.477-1.98-.477-.637 0-1.321.159-2.054.477-.734.32-1.324.479-1.77.479-.67.012-1.344-.288-2.018-.9-.43-.373-.963-1.037-1.597-1.992a11.847 11.847 0 0 1-1.682-3.26 10.75 10.75 0 0 1-.643-3.684c0-1.5.324-2.802.973-3.902a5.09 5.09 0 0 1 1.804-1.84 4.802 4.802 0 0 1 2.41-.65c.472 0 1.09.183 1.852.546.76.364 1.25.548 1.47.548.163 0 .719-.2 1.667-.6.894-.374 1.65-.53 2.265-.467 1.676.135 2.936.795 3.776 1.982-1.497.91-2.245 2.184-2.245 3.822 0 1.268.48 2.34 1.437 3.214.425.401.9.709 1.428.925-.113.332-.232.66-.359.986z'
              fill='currentColor'
            />
          </svg>

          <span className='sr-only'>Continue with Apple</span>
        </>
      )}
    </Button>
  )
}

export default function AppleAuthForm() {
  return (
    <form action={signInWithApple} className='flex flex-1'>
      <SubmitButton />
    </form>
  )
}
