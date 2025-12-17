'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle, Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type InstallState = 'loading' | 'ready' | 'installed' | 'unsupported'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform?: string
  }>
}

export default function Page() {
  const [state, setState] = useState<InstallState>('loading')
  const deferredEvent = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Detect already-installed PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (standalone) {
      setState('installed')
      return
    }

    const handler = (e: Event) => {
      const ev = e as BeforeInstallPromptEvent
      ev.preventDefault()
      deferredEvent.current = ev
      setState('ready')
    }

    window.addEventListener('beforeinstallprompt', handler)

    const timeout = setTimeout(() => {
      setState((prev) => (prev === 'loading' ? 'unsupported' : prev))
    }, 1200)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timeout)
    }
  }, [])

  const handleInstall = async () => {
    const event = deferredEvent.current
    if (!event) return
    event.prompt()
    await event.userChoice
    deferredEvent.current = null
    setState('unsupported')
  }

  const getPWAButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Spinner /> Checking PWA install availability…
          </>
        )
      case 'ready':
        return (
          <>
            <Download /> Install Chatly as a PWA
          </>
        )
      case 'installed':
        return (
          <>
            <CheckCircle /> Chatly is already installed as a PWA 🎉
          </>
        )
      case 'unsupported':
        return (
          <>
            <AlertCircle /> PWA install is unsupported
          </>
        )
    }
  }

  return (
    <div className='p-8'>
      <Button
        className='cursor-pointer'
        disabled={state !== 'ready'}
        onClick={handleInstall}
      >
        {getPWAButtonContent()}
      </Button>
    </div>
  )
}
