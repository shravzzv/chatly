// apps/native/app/(public)/reset-password.tsx
import { ResetPasswordForm } from '@/components/reset-password-form'
import { Screen } from '@/components/ui/screen'

export default function Page() {
  return (
    <Screen className='items-center justify-center bg-muted px-6'>
      <ResetPasswordForm />
    </Screen>
  )
}
