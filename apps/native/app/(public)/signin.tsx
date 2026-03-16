// apps/native/app/(public)/signin.tsx
import { Screen } from '@/components/ui/screen'
import { SignInForm } from '../../components/signin-form'

export default function Page() {
  return (
    <Screen className='items-center justify-center bg-muted px-6'>
      <SignInForm />
    </Screen>
  )
}
