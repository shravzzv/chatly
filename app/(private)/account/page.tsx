'use client'

import AccountDangerZone from '@/components/account-danger-zone'
import AccountEmail from '@/components/account-email'
import AccountHeader from '@/components/account-header'
import AccountPassword from '@/components/account-password'
import AccountPreferences from '@/components/account-preferences'
import AccountProfileSection from '@/components/account-profile-section'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <div className='p-8 h-[calc(100vh-1rem)] overflow-y-auto rounded-xl'>
      <AccountHeader />

      <main className='mt-8 mx-auto max-w-xl space-y-12'>
        <AccountProfileSection />
        <AccountPreferences />

        <section className='space-y-6'>
          <h2 className='text-lg font-semibold'>Account</h2>

          <AccountEmail />
          <AccountPassword />

          <div className='flex gap-2'>
            <Button variant='outline'>Log out</Button>
            <Button variant='outline'>Log out everywhere</Button>
          </div>
        </section>

        <AccountDangerZone />
      </main>
    </div>
  )
}
