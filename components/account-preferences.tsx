'use client'

import { useState } from 'react'
import { ModeToggle } from './mode-toggle'
import { Switch } from './ui/switch'

export default function AccountPreferences() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [push, setPush] = useState(true)

  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold'>Preferences</h2>

      <div className='flex items-center justify-between'>
        <span>Theme</span>
        <ModeToggle />
      </div>

      <div className='flex items-center justify-between'>
        <span>Push notifications</span>
        <Switch checked={push} onCheckedChange={setPush} />
      </div>
    </section>
  )
}
