// apps/native/app/(public)/signin.tsx
import { SignInForm } from '@/components/sign-in-form'
import { Screen } from '@/components/ui/screen'

export default function Page() {
  return (
    <Screen className='items-center justify-center bg-muted px-6'>
      <SignInForm />
    </Screen>
  )
}
