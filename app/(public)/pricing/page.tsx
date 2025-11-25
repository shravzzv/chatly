'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

type Plan = 'pro' | 'enterprise'
type Billing = 'monthly' | 'yearly'

interface CheckoutLink {
  plan: Plan
  billing: Billing
  url: string
}

const plans = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Get started with Chatly and explore the basics for free.',
    features: [
      'Text chat with basic AI model',
      '20 messages per day',
      'Up to 3 image chats per day',
      'No audio or video calls',
      '1 workspace',
      'Community support',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    priceMonthly: 10,
    priceYearly: 100,
    description: 'Unlock advanced AI features, unlimited chats, and calls.',
    features: [
      'Everything in Free',
      'Unlimited messages & image chats',
      'Audio & video calls (up to 60 mins/session)',
      'Access to advanced AI models',
      'Up to 5 workspaces',
      'Custom prompts & saved chats',
      'Priority email support',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 49,
    priceYearly: 490,
    description:
      'Tailored solutions and premium support for large teams and organizations.',
    features: [
      'Everything in Pro',
      'Unlimited call duration',
      'Team & admin management dashboard',
      'Centralized billing',
      'Dedicated account manager',
      'Custom security & compliance options',
      'SLA & onboarding support',
    ],
    highlight: false,
  },
]

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription anytime from your billing dashboard. You’ll still have full access until the end of your current billing cycle.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Refunds are handled on a case-by-case basis. If you believe there’s been a mistake or issue with billing, reach out to our support team within 14 days for assistance.',
  },
  {
    question: 'Is there a discount for yearly billing?',
    answer: `Yes! If you choose annual billing, you'll save 20% compared to the monthly plan. We love rewarding long-term commitment.`,
  },
  {
    question: 'Do you offer team or enterprise billing?',
    answer:
      'Yes, our Enterprise plan includes centralized billing, dedicated account management, and tailored pricing for larger teams or organizations.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards, as well as PayPal for annual subscriptions. For Enterprise customers, we also support invoicing and wire transfers.',
  },
]

const checkoutLinks: CheckoutLink[] = [
  {
    plan: 'pro',
    billing: 'monthly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/7387a8e5-60bd-4d46-b7e7-52f8376f76db',
  },
  {
    plan: 'pro',
    billing: 'yearly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/fa42cdcd-57f1-49a5-ab56-ff4b8d3941ea',
  },
  {
    plan: 'enterprise',
    billing: 'monthly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/a3cfbc86-3813-4ef6-9847-e4151d0607cf',
  },
  {
    plan: 'enterprise',
    billing: 'yearly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/6ba00985-2df0-41c3-b014-931ac7bfbf9c',
  },
]

const getCheckoutUrl = (plan: Plan, billing: Billing, user: User | null) => {
  const base = checkoutLinks.find(
    (link) => link.plan === plan && link.billing === billing
  )?.url

  if (!base) return null
  if (!user) return base

  const params = new URLSearchParams({
    'checkout[email]': user.email ?? '',
    'checkout[custom][user_id]': user.id,
  })

  return `${base}?${params.toString()}`
}

const getPlanUrl = (planName: string, billing: Billing, user: User | null) => {
  const plan = planName.toLowerCase()
  if (plan === 'free') return user ? '/dashboard' : '/signup'

  return user
    ? getCheckoutUrl(plan as Plan, billing, user)!
    : `/signup?redirectToPlan=${plan}&billing=${billing}`
}

export default function Page() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  )
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

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
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`transition hover:shadow-lg ${
              plan.highlight && 'border-2 border-black dark:border-white'
            }`}
          >
            <CardHeader>
              <CardTitle className='flex gap-4 items-center text-2xl font-bold'>
                {plan.name}
                {plan.highlight && <Badge>Most Popular</Badge>}
              </CardTitle>
              <CardDescription className='mt-2 text-muted-foreground'>
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className='text-4xl font-extrabold'>
                $
                {billingCycle === 'monthly'
                  ? plan.priceMonthly
                  : plan.priceYearly}
              </p>

              <Button
                asChild
                className='w-full mt-6'
                variant={plan.highlight ? 'default' : 'outline'}
              >
                <Link href={getPlanUrl(plan.name, billingCycle, user)}>
                  {loading ? (
                    <>
                      <Spinner /> Loading
                    </>
                  ) : plan.name === 'Free' ? (
                    user ? (
                      'Go to Dashboard'
                    ) : (
                      'Get Started'
                    )
                  ) : user ? (
                    'Upgrade'
                  ) : (
                    'Get Started'
                  )}
                </Link>
              </Button>
            </CardContent>

            <CardFooter>
              <ul className='space-y-2'>
                {plan.features.map((feature) => (
                  <li key={feature} className='text-muted-foreground text-sm'>
                    • {feature}
                  </li>
                ))}
              </ul>
            </CardFooter>
          </Card>
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
            {faqs.map((item, i) => (
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
