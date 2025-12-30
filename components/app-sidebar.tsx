'use client'

import * as React from 'react'
import {
  CreditCard,
  LayoutDashboard,
  Settings,
  Star,
  User as UserIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'
import { useUser } from '@/hooks/use-user'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: UserIcon,
  },
  {
    title: 'Plan',
    href: '/plan',
    icon: CreditCard,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading, error } = useUser()
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  // multitab logout redirect
  React.useEffect(() => {
    if (!loading && !user && pathname !== '/signin') router.replace('/signin')
  }, [user, loading, pathname, router])

  const handleLinkClick = () => setOpenMobile(false)

  if (error) console.error(error)

  return (
    <Sidebar {...props} variant='inset' collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:p-1.5!'
            >
              <Link href='/dashboard' onClick={handleLinkClick}>
                <Star className='size-5!' />
                <span className='text-base font-semibold'>Chatly</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.href} onClick={handleLinkClick}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>{user && <NavUser userId={user?.id} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
