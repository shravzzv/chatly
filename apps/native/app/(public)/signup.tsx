// apps/native/app/(public)/signup.tsx
import { SignUpForm } from '@/components/signup-form'
import { Screen } from '@/components/ui/screen'

export default function Page() {
  return (
    <Screen className='items-center justify-center bg-muted px-6'>
      <SignUpForm />
    </Screen>
  )
}
