'use client'

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
import { cn } from '@/lib/utils'
import { useNetworkContext } from '@/providers/network-provider'
import {
  CreditCard,
  LayoutDashboard,
  Star,
  User as UserIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { NavUser } from './nav-user'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Account',
    href: '/account',
    icon: UserIcon,
  },
  {
    title: 'Plan',
    href: '/plan',
    icon: CreditCard,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const { isOnline } = useNetworkContext()
  const pathname = usePathname()

  const handleLinkClick = () => setOpenMobile(false)

  return (
    <Sidebar {...props} variant='inset' collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='cursor-pointer disabled:cursor-not-allowed data-[slot=sidebar-menu-button]:p-1.5!'
              disabled={!isOnline}
            >
              <Link
                href='/dashboard'
                onClick={handleLinkClick}
                className={cn(
                  !isOnline && 'pointer-events-none cursor-not-allowed',
                )}
              >
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
                      disabled={!isOnline}
                      className='cursor-pointer disabled:cursor-not-allowed'
                    >
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          !isOnline && 'pointer-events-none cursor-not-allowed',
                        )}
                      >
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

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
