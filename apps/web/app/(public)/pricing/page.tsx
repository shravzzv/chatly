'use client'

import { getSubscriptions } from '@/app/actions'
import PricingCard from '@/components/pricing-card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/data/plans'
import { pricingFAQs } from '@/data/pricing-faqs'
import { getEffectiveSubscription } from '@/lib/billing'
import { getCTAState } from '@/lib/pricing'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import type { Billing, Subscription } from '@chatly/types/subscription'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Page() {
  const [billingCycle, setBillingCycle] = useState<Billing>('monthly')
  const [sub, setSub] = useState<Subscription | null>(null)
  const user = useChatlyStore((state) => state.user)

  useEffect(() => {
    if (!user) return

    async function loadSub() {
      const subs = await getSubscriptions()
      const effectiveSub = getEffectiveSubscription(subs)
      if (effectiveSub) setSub(effectiveSub)
    }

    loadSub()
  }, [user])

  return (
    <main className='flex w-full flex-col items-center justify-center'>
      <section className='w-full max-w-6xl px-6 py-16 pb-12 text-center sm:pt-20 md:pt-24'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
          Simple, Transparent Pricing
        </h1>

        <p className='text-muted-foreground mx-auto mt-8 max-w-xl text-lg'>
          Start free. Upgrade as your team grows.
        </p>

        <div className='mt-8 flex flex-col items-center gap-2'>
          <div className='inline-flex items-center rounded-full border border-gray-300 p-1 dark:border-gray-700'>
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setBillingCycle('monthly')}
              className='cursor-pointer rounded-full px-5'
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setBillingCycle('yearly')}
              className='cursor-pointer rounded-full px-5'
            >
              Yearly
            </Button>
          </div>

          <p className='text-muted-foreground text-sm'>
            Save <span className='text-foreground font-semibold'>20%</span> with
            yearly billing
          </p>
        </div>
      </section>

      <section className='mb-20 grid w-full max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3'>
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            cta={getCTAState({ user, sub, billingCycle, planName: plan.name })}
            billingCycle={billingCycle}
          />
        ))}
      </section>

      <section className='bg-background w-full py-16 sm:py-20 md:py-24'>
        <div className='mx-auto max-w-4xl px-6 text-center'>
          <h2 className='mb-10 text-3xl font-bold tracking-tight sm:text-4xl'>
            Frequently Asked Questions
          </h2>

          <Accordion
            type='single'
            collapsible
            className='w-full space-y-2 text-left md:space-y-4'
          >
            {pricingFAQs.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className='cursor-pointer text-base font-medium hover:no-underline'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground leading-relaxed'>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className='w-full py-24 text-center'>
        <div className='mx-auto max-w-2xl px-6'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            Ready to get started?
          </h2>
          <p className='text-muted-foreground mx-auto mt-8 max-w-xl text-lg'>
            Start free, upgrade anytime. No credit card required.
          </p>

          <div className='mt-8 flex justify-center'>
            <Button asChild size='lg'>
              <Link href={user ? '/dashboard' : '/signup'}>Start for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
