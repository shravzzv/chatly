import { User } from '@supabase/supabase-js'
import { Billing, Plan } from '@/types/subscription'
import { checkoutLinks } from '@/data/checkout-links'

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
