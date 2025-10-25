'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { signInWithGithub } from '@/app/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      variant='outline'
      type='submit'
      className='cursor-pointer w-full h-10 p-0 flex items-center justify-center'
      disabled={pending}
      title='Continue with GitHub'
    >
      {pending ? (
        <Spinner />
      ) : (
        <>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
            <path
              d='M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.578v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.547-1.387-1.333-1.758-1.333-1.758-1.09-.744.083-.728.083-.728 1.203.085 1.836 1.236 1.836 1.236 1.07 1.835 2.807 1.305 3.492.997.107-.776.42-1.305.762-1.605-2.665-.304-5.467-1.334-5.467-5.931 0-1.31.468-2.382 1.236-3.221-.124-.304-.535-1.528.117-3.184 0 0 1.008-.322 3.3 1.23a11.48 11.48 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.292-1.552 3.3-1.23 3.3-1.23.652 1.656.241 2.88.118 3.184.77.839 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.431.372.815 1.106.815 2.229v3.301c0 .321.192.696.8.577C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z'
              fill='currentColor'
            />
          </svg>
          <span className='sr-only'>Continue with GitHub</span>
        </>
      )}
    </Button>
  )
}

export default function GitHubAuthForm() {
  return (
    <form action={signInWithGithub} className='flex flex-1'>
      <SubmitButton />
    </form>
  )
}
