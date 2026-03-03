'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SidebarTrigger() {
  const { toggleSidebar, open } = useSidebar()

  return (
    <button
      onClick={toggleSidebar}
      aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-accent-foreground cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      <PanelLeft className='h-5 w-5 transition-transform duration-200' />
    </button>
  )
}
