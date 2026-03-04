import { SidebarTrigger } from './sidebar-trigger'

export default function AccountHeader() {
  return (
    <header className='bg-background flex items-center gap-4 py-4'>
      <SidebarTrigger />
      <h1 className='text-xl font-semibold'>Account</h1>
    </header>
  )
}
