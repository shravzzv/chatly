'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { Billing, Subscription } from '@/types/subscription'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { getSubscriptions } from '@/app/actions'
import { getEffectiveSubscription } from '@/lib/billing'
import PricingCard from '@/components/pricing-card'
import { pricingFAQs } from '@/data/pricing-faqs'
import { PLANS } from '@/data/plans'
import { getCTAState } from '@/lib/pricing'

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
    <main className='flex flex-col items-center justify-center w-full'>
      <section className='w-full max-w-6xl px-6 py-16 sm:pt-20 md:pt-24 pb-12 text-center'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
          Simple, Transparent Pricing
        </h1>

        <p className='mt-8 text-lg text-muted-foreground max-w-xl mx-auto'>
          Start free. Upgrade as your team grows.
        </p>

        <div className='mt-8 flex flex-col items-center gap-2'>
          <div className='inline-flex items-center rounded-full border border-gray-300 dark:border-gray-700 p-1'>
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setBillingCycle('monthly')}
              className='rounded-full px-5 cursor-pointer'
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setBillingCycle('yearly')}
              className='rounded-full px-5 cursor-pointer'
            >
              Yearly
            </Button>
          </div>

          <p className='text-sm text-muted-foreground'>
            Save <span className='font-semibold text-foreground'>20%</span> with
            yearly billing
          </p>
        </div>
      </section>

      <section className='w-full max-w-6xl px-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-20'>
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            cta={getCTAState({ user, sub, billingCycle, planName: plan.name })}
            billingCycle={billingCycle}
          />
        ))}
      </section>

      <section className='w-full py-16 sm:py-20 md:py-24 bg-background'>
        <div className='max-w-4xl mx-auto px-6 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold tracking-tight mb-10'>
            Frequently Asked Questions
          </h2>

          <Accordion
            type='single'
            collapsible
            className='w-full text-left space-y-2 md:space-y-4'
          >
            {pricingFAQs.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className='text-base font-medium hover:no-underline cursor-pointer'>
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
        <div className='max-w-2xl mx-auto px-6'>
          <h2 className='text-3xl sm:text-4xl font-bold tracking-tight'>
            Ready to get started?
          </h2>
          <p className='mt-8 text-lg text-muted-foreground max-w-xl mx-auto'>
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
