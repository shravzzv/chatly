import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from './sidebar-trigger'
import { ModeToggle } from './mode-toggle'

export function SiteHeader() {
  return (
    <header className='flex h-(--header-height) min-h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-50 bg-background rounded-t-xl'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger />

        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />

        <ModeToggle />
      </div>
    </header>
  )
}
