import { SidebarTrigger } from './sidebar-trigger'

export default function AccountHeader() {
  return (
    <header className='flex items-center gap-4 bg-background py-4'>
      <SidebarTrigger />
      <h1 className='text-xl font-semibold'>Account</h1>
    </header>
  )
}
