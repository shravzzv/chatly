// apps/native/app/(public)/signup.tsx
import AuthLegalText from '@/components/auth-legal-text'
import { SignUpForm } from '@/components/signup-form'
import { Screen } from '@/components/ui/screen'

export default function Page() {
  return (
    <Screen className='items-center justify-center gap-2 bg-muted px-6'>
      <SignUpForm />
      <AuthLegalText />
    </Screen>
  )
}
