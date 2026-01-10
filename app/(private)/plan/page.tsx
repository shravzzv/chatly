'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscription } from '@/hooks/use-subscription'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import { SidebarTrigger } from '@/components/sidebar-trigger'
import { useChatlyStore } from '@/providers/chatly-store-provider'

export default function Page() {
  const user = useChatlyStore((state) => state.user)

  const { subscription, loading: subscriptionLoading } = useSubscription(
    user?.id
  )
  const isLoading = subscriptionLoading || user === null

  if (isLoading) {
    return (
      <section className='flex flex-col items-center w-full p-4'>
        <Card className='mb-8 w-full max-w-sm'>
          <CardHeader>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-24 mt-2' />
          </CardHeader>

          <CardContent>
            <Skeleton className='h-4 w-32' />
          </CardContent>

          <CardFooter className='flex gap-3'>
            <Skeleton className='h-10 w-28' />
            <Skeleton className='h-10 w-28' />
          </CardFooter>
        </Card>
      </section>
    )
  }

  if (!subscription) {
    return (
      <section className='flex flex-col items-center w-full p-4'>
        <Card className='mb-8 w-full max-w-sm'>
          <CardHeader>
            <CardTitle>Your Current Plan</CardTitle>
            <CardDescription>You&apos;re on the free plan.</CardDescription>
          </CardHeader>

          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Upgrade to unlock unlimited messaging, AI calls, and more.
            </p>
          </CardContent>

          <CardFooter>
            <Button asChild>
              <Link href='/pricing'>View Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
  }

  const renewDate = subscription.renews_at
    ? new Date(subscription.renews_at).toLocaleDateString()
    : null

  const endDate = subscription.ends_at
    ? new Date(subscription.ends_at).toLocaleDateString()
    : null

  return (
    <section className='flex flex-col items-center w-full p-4'>
      <SidebarTrigger />

      <Card className='mb-8 w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
          <CardDescription>
            {subscription.plan.toUpperCase()} •{' '}
            <span className='capitalize'>{subscription.billing}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-2'>
          <p className='text-sm'>
            <span className='font-medium'>Status:</span>{' '}
            <span className='capitalize'>{subscription.status}</span>
          </p>

          {renewDate && (
            <p className='text-sm'>
              <span className='font-medium'>Renews on:</span> {renewDate}
            </p>
          )}

          {endDate && (
            <p className='text-sm text-muted-foreground'>
              Access ends on: {endDate}
            </p>
          )}
        </CardContent>

        <CardFooter className='flex gap-2'>
          <Button asChild>
            <Link href={LS_CUSTOMER_PORTAL_URL}>Manage Billing</Link>
          </Button>
          <Button variant='secondary' asChild>
            <Link href='/pricing'>View All Plans</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
