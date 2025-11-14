'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform?: string
  }>
}

export default function Page() {
  const deferredEvent = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as BeforeInstallPromptEvent
      ev.preventDefault()
      deferredEvent.current = ev
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleClick = async () => {
    const event = deferredEvent.current
    if (event) {
      event.prompt()
      try {
        await event.userChoice
      } finally {
        deferredEvent.current = null
      }
    }
  }

  return (
    <div className='p-8'>
      <Button className='cursor-pointer' onClick={handleClick}>
        <Download />
        Install to home screen
      </Button>
    </div>
  )
}
