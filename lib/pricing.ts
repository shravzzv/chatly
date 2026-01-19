import { PricingPlanName } from '@/data/plans'
import { Billing, Plan, Subscription } from '@/types/subscription'
import { User } from '@supabase/supabase-js'
import { getCheckoutUrl } from './get-checkout-url'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'

interface GetCTAStateProps {
  user: User | null
  sub: Subscription | null
  billingCycle: Billing
  planName: PricingPlanName
}

/**
 * Resolves the primary CTA (label + destination) for a pricing plan card
 * based on authentication and subscription state.
 *
 * Rules:
 * - Checkout is only used when the user has no subscription.
 * - All plan changes for subscribed users go through the billing portal.
 * - Free plan always routes to dashboard when authenticated.
 */
export const getCTAState = ({
  user,
  sub,
  billingCycle,
  planName,
}: GetCTAStateProps) => {
  const isAuthenticated = !!user
  const hasActiveSub = !!sub
  const isForFreePlan = planName === 'Free'

  // 1. Unauthenticated
  if (!isAuthenticated) {
    return {
      label: 'Get Started',
      href: isForFreePlan
        ? '/signup'
        : `/signup?plan=${planName.toLowerCase()}&billing=${billingCycle}`,
    }
  }

  // 2. Authenticated, NO subscription
  if (!hasActiveSub) {
    return {
      label: isForFreePlan ? 'Go to Dashboard' : 'Upgrade',
      href: isForFreePlan
        ? '/dashboard'
        : getCheckoutUrl(planName.toLowerCase() as Plan, billingCycle, user)!,
    }
  }

  // 3. Authenticated, HAS subscription
  return {
    label: isForFreePlan ? 'Go to Dashboard' : 'Manage Billing',
    href: isForFreePlan ? '/dashboard' : LS_CUSTOMER_PORTAL_URL,
  }
}
