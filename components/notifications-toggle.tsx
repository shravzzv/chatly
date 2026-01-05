'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from '@/app/actions'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function NotificationsToggle() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )

  // Check support and register service worker
  useEffect(() => {
    async function checkSupport() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true)
        await registerServiceWorker()
      }
    }
    checkSupport()
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true)
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    } catch (err) {
      console.error('Subscription failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true)
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (err) {
      console.error('Unsubscription failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTogglePush(enabled: boolean) {
    if (enabled) await subscribeToPush()
    else await unsubscribeFromPush()
  }

  if (!isSupported) {
    return (
      <Alert className='mb-4' variant='destructive'>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          Your browser doesn&apos;t fully support web push notifications. On
          mobile devices, you can install this website as a PWA (via “Add to
          Home screen”) to receive notifications even when the browser is
          closed.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='flex items-center justify-between'>
      <span>Web push notifications</span>

      <Switch
        id='push-toggle'
        checked={!!subscription}
        onCheckedChange={handleTogglePush}
        disabled={isLoading}
        className='cursor-pointer'
      />
    </div>
  )
}
