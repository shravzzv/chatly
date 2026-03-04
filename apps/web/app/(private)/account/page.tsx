import AccountHeader from '@/components/account-header'
import AccountProfileSection from '@/components/account-profile-section'
import AccountPreferencesSection from '@/components/account-preferences-section'
import AccountSecuritySection from '@/components/account-security-section'
import AccountDangerZone from '@/components/account-danger-zone'

export default function Page() {
  return (
    <div className='h-[calc(100vh-1rem)] overflow-y-auto rounded-xl p-8'>
      <AccountHeader />

      <main className='mx-auto mt-4 max-w-xl space-y-12'>
        <AccountProfileSection />
        <AccountPreferencesSection />
        <AccountSecuritySection />
        <AccountDangerZone />
      </main>
    </div>
  )
}
