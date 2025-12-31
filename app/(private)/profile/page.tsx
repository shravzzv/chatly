'use client'

import { SidebarTrigger } from '@/components/sidebar-trigger'
import { useProfile } from '@/hooks/use-profile'
import { useUser } from '@/hooks/use-user'

export default function Page() {
  const { user } = useUser()
  const { profile } = useProfile(user?.id)
  console.log('user', user)
  console.log('profile', profile)

  return (
    <div className='p-8'>
      <SidebarTrigger />
      <p>Profile page</p>
    </div>
  )
}
