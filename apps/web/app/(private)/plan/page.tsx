import { SidebarTrigger } from '@/components/sidebar-trigger'
import { Separator } from '@/components/ui/separator'
import CurrentPlanSection from '@/components/current-plan-section'

export default function Page() {
  return (
    <div className='h-[calc(100vh-1rem)] overflow-y-auto rounded-xl p-8'>
      <header className='bg-background flex items-center gap-4 py-4'>
        <SidebarTrigger />
        <h1 className='text-xl font-semibold'>Plan</h1>
      </header>

      <main className='mx-auto mt-4 max-w-xl space-y-4'>
        <CurrentPlanSection />
        <Separator />
        <p className='text-muted-foreground text-xs'>
          Billing and payments are managed securely via Lemon Squeezy.
        </p>
      </main>
    </div>
  )
}
