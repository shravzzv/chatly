// apps/native/app/(public)/forgot-password.tsx
import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { Screen } from '@/components/ui/screen'

export default function Page() {
  return (
    <Screen className='items-center justify-center bg-muted px-6'>
      <ForgotPasswordForm />
    </Screen>
  )
}
