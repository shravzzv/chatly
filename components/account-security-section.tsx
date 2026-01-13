import AccountEmailInput from './account-email-input'
import AccountPasswordInput from './account-password-input'
import AccountEmailStatus from './account-email-status'
import AccountLogoutActions from './account-logout-actions'

export default function AccountSecuritySection() {
  return (
    <section className='space-y-6'>
      <h2 className='text-lg font-semibold'>Security</h2>
      <AccountEmailStatus />
      <AccountEmailInput />
      <AccountPasswordInput />
      <AccountLogoutActions />
    </section>
  )
}
