import AccountHeader from '@/components/account-header'
import AccountProfileSection from '@/components/account-profile-section'
import AccountPreferencesSection from '@/components/account-preferences-section'
import AccountSecuritySection from '@/components/account-security-section'
import AccountDangerZone from '@/components/account-danger-zone'

export default function Page() {
  return (
    <div className='p-8 h-[calc(100vh-1rem)] overflow-y-auto rounded-xl'>
      <AccountHeader />

      <main className='mt-4 mx-auto max-w-xl space-y-12'>
        <AccountProfileSection />
        <AccountPreferencesSection />
        <AccountSecuritySection />
        <AccountDangerZone />
      </main>
    </div>
  )
}
