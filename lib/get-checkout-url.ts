import { User } from '@supabase/supabase-js'
import { Billing, Plan } from '@/types/subscription'
import { checkoutLinks } from '@/data/checkout-links'

/**
 * Generates a Lemon Squeezy checkout URL for a given plan and billing cycle.
 *
 * Behavior:
 * - Resolves the base checkout URL from static `checkoutLinks`
 * - Optionally enriches the URL with user-specific metadata
 * - Returns `null` when no matching checkout link exists
 *
 * User handling:
 * - If `user` is `null`, returns the raw checkout URL
 * - If `user` is provided:
 *   - Prefills the checkout email
 *   - Attaches the internal user id as custom metadata
 *
 * This allows:
 * - Anonymous users to start checkout
 * - Authenticated users to have a prefilled, traceable checkout
 *
 * @param plan
 * The subscription plan being purchased (e.g. `free`, `pro`)
 *
 * @param billing
 * The billing cadence for the plan (e.g. `monthly`, `yearly`)
 *
 * @param user
 * The currently authenticated user, if available.
 * Used to prefill checkout details and associate the purchase
 * with an internal user id.
 *
 * @returns
 * - A fully-qualified checkout URL when a matching plan/billing exists
 * - `null` when no checkout link is defined for the given inputs
 */
export const getCheckoutUrl = (
  plan: Plan,
  billing: Billing,
  user: User | null,
) => {
  const base = checkoutLinks.find(
    (link) => link.plan === plan && link.billing === billing,
  )?.url

  if (!base) return null
  if (!user) return base

  const params = new URLSearchParams({
    'checkout[email]': user.email ?? '',
    'checkout[custom][user_id]': user.id,
  })

  return `${base}?${params.toString()}`
}
