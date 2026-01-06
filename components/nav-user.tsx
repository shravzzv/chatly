'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Download, EllipsisVertical, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from './ui/spinner'
import ProfileAvatar from './profile-avatar'

const getUserIdentity = (name: string | null, username: string | null) => {
  const safeName = name || 'User'
  const safeUsername = username || 'user'

  return (
    <>
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{safeName}</span>
        <span className='text-muted-foreground truncate text-xs'>
          @{safeUsername}
        </span>
      </div>
    </>
  )
}

export function NavUser({ userId }: { userId: string }) {
  const { isMobile } = useSidebar()
  const { profile, loading, error } = useProfile(userId)

  if (error) console.error(error)

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      console.error('Error signing out:', error)
      toast.info('Logout failed. Please check your connection and try again.')
    }
    // no redirect because app-sidebar's useEffect handles it on signout
  }

  if (loading || !profile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <Spinner className='mx-auto' />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const { name, username } = profile

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
            >
              <ProfileAvatar profile={profile} rounded='lg' />
              {getUserIdentity(name, username)}
              <EllipsisVertical className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <ProfileAvatar profile={profile} rounded='lg' />
                {getUserIdentity(name, username)}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='cursor-pointer' asChild>
              <Link href='/download' rel='noopener noreferrer' target='_blank'>
                <Download />
                Download apps
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              className='cursor-pointer'
              onClick={handleLogout}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
