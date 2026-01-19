import { ModeToggle } from './mode-toggle'
import { NotificationsToggle } from './notifications-toggle'

export default function AccountPreferencesSection() {
  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold'>Preferences</h2>

      <div className='flex items-center justify-between'>
        <span>Theme</span>
        <ModeToggle />
      </div>

      <NotificationsToggle />
    </section>
  )
}
