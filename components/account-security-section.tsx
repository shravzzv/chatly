import AccountEmailInput from './account-email-input'
import AccountPasswordInput from './account-password-input'
import { Button } from './ui/button'

export default function AccountSecuritySection() {
  return (
    <section className='space-y-6'>
      <h2 className='text-lg font-semibold'>Security</h2>

      <AccountEmailInput />
      <AccountPasswordInput />

      <div className='flex gap-2'>
        <Button variant='outline'>Log out</Button>
        <Button variant='outline'>Log out of everywhere</Button>
      </div>
    </section>
  )
}
