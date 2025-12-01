import { User } from '@supabase/supabase-js'
import { Billing, Plan } from '@/types/subscription'

interface CheckoutLink {
  plan: Plan
  billing: Billing
  url: string
}

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

export const getCheckoutUrl = (
  plan: Plan,
  billing: Billing,
  user: User | null
) => {
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
