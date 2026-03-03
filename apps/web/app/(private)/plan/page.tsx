import { SidebarTrigger } from '@/components/sidebar-trigger'
import { Separator } from '@/components/ui/separator'
import CurrentPlanSection from '@/components/current-plan-section'

export default function Page() {
  return (
    <div className='p-8 h-[calc(100vh-1rem)] overflow-y-auto rounded-xl'>
      <header className='flex items-center gap-4 bg-background py-4'>
        <SidebarTrigger />
        <h1 className='text-xl font-semibold'>Plan</h1>
      </header>

      <main className='mt-4 mx-auto max-w-xl space-y-4'>
        <CurrentPlanSection />
        <Separator />
        <p className='text-xs text-muted-foreground'>
          Billing and payments are managed securely via Lemon Squeezy.
        </p>
      </main>
    </div>
  )
}
