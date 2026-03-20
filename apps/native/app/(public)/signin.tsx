// apps/native/app/(public)/signin.tsx
import AuthLegalText from '@/components/auth-legal-text'
import { Screen } from '@/components/ui/screen'
import { SignInForm } from '../../components/signin-form'

export default function Page() {
  return (
    <Screen className='items-center justify-center gap-2 bg-muted px-6'>
      <SignInForm />
      <AuthLegalText />
    </Screen>
  )
}
