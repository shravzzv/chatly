import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Spinner } from '../ui/spinner'

export default function NavUserSkeleton() {
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
