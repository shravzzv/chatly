import type { Subscription, SubscriptionStatus } from '@/types/subscription'

/**
 * Lightweight feature highlights shown in the UI for paid plans.
 *
 * These are NOT a full capability model and should not be used for
 * entitlement or enforcement logic. They exist purely for display
 * inside plan cards.
 */
export const PAID_PLAN_HIGHLIGHTS: Record<'pro' | 'enterprise', string[]> = {
  pro: ['Media attachments', 'AI-assisted message improvements'],
  enterprise: [
    'Up to 50 media attachments per day',
    'Up to 20 AI-assisted message improvements per day',
  ],
}

/**
 * Subscription statuses that represent a paid subscription which may
 * still grant access, depending on context.
 *
 * NOTE:
 * - `cancelled` is intentionally excluded here because it may or may not
 *   still be active depending on `ends_at`.
 * - `expired` never grants access.
 */
const PAID_STATUSES: SubscriptionStatus[] = [
  'on_trial',
  'active',
  'paused',
  'past_due',
  'unpaid',
]

/**
 * Determines whether a cancelled subscription is still within its
 * post-cancellation grace period.
 *
 * Business rule:
 * - A cancelled subscription remains active until `ends_at`.
 * - If `ends_at` is in the future, access is still granted.
 */
const isCancelledButActive = (sub: Subscription): boolean => {
  if (sub.status !== 'cancelled') return false
  if (!sub.ends_at) return false
  return new Date(sub.ends_at) > new Date()
}

/**
 * Determines whether a subscription is inactive and no longer grants access.
 *
 * A subscription is considered inactive if:
 * - It is explicitly expired, OR
 * - It was cancelled and its grace period has ended
 *
 * This is a derived predicate and should not contain independent
 * business logic beyond delegating to cancellation rules.
 */
export const isInactive = (sub: Subscription): boolean =>
  sub.status === 'expired' || !isCancelledButActive(sub)

/**
 * Determines whether a subscription currently grants access.
 *
 * A subscription is considered effective if:
 * - It is in a paid status (`on_trial`, `active`, `paused`, `past_due` and `unpaid`), OR
 * - It is cancelled but still within its grace period
 *
 * This is the canonical "does the user have access?" predicate.
 * All higher-level billing decisions should build on top of this.
 */
export function isEffectiveSubscription(sub: Subscription): boolean {
  return PAID_STATUSES.includes(sub.status) || isCancelledButActive(sub)
}

/**
 * Assigns a priority score to a subscription status for comparison.
 *
 * Higher values indicate a more effective or preferable subscription
 * when multiple subscriptions exist for the same user.
 *
 * Priority order (highest → lowest):
 * - `active` / `on_trial`
 * - `paused` / `past_due` / `unpaid`
 * - `cancelled`
 * - `expired`
 *
 * This function encodes business policy, not data ordering.
 */
function getRank(status: SubscriptionStatus): number {
  switch (status) {
    case 'on_trial':
    case 'active':
      return 3

    case 'paused':
    case 'past_due':
    case 'unpaid':
      return 2

    case 'cancelled':
      return 1

    case 'expired':
    default:
      return 0
  }
}

/**
 * Comparator used to determine which subscription should be considered
 * the "most effective" when multiple subscriptions exist.
 *
 * Comparison rules:
 * 1. Prefer subscriptions with higher status priority
 * 2. If priorities match, prefer the subscription with the most
 *    relevant recent date (`ends_at` if present, otherwise `created_at`)
 *
 * This comparator is designed to be used after filtering to
 * effective subscriptions.
 */
export function compareSubscriptions(a: Subscription, b: Subscription): number {
  const rankDiff = getRank(b.status) - getRank(a.status)
  if (rankDiff !== 0) return rankDiff

  const dateA = new Date(a.ends_at ?? a.created_at).getTime()
  const dateB = new Date(b.ends_at ?? b.created_at).getTime()
  return dateB - dateA
}

/**
 * Returns the single most effective subscription for a user.
 *
 * Process:
 * - Filters out subscriptions that do not currently grant access
 * - Sorts remaining subscriptions by priority and recency
 * - Returns the best candidate, if any
 *
 * If no effective subscription exists, returns null.
 */
export function getEffectiveSubscription(
  subs: Subscription[],
): Subscription | null {
  const effectiveSubs = subs.filter(isEffectiveSubscription)
  if (effectiveSubs.length === 0) return null
  return effectiveSubs.sort(compareSubscriptions)[0]
}

/**
 * Resolves the user's current plan based on effective subscriptions.
 *
 * If no subscription currently grants access, the user is considered
 * to be on the free plan.
 */
export function getCurrentPlan(
  subs: Subscription[],
): 'free' | 'pro' | 'enterprise' {
  const effectiveSub = getEffectiveSubscription(subs)
  if (!effectiveSub) return 'free'
  return effectiveSub.plan
}

/**
 * Returns the most recently ended paid subscription.
 *
 * Used to detect "demoted" users who previously had access but no
 * longer do.
 *
 * Selection rules:
 * - Only considers inactive subscriptions
 * - Chooses the one with the most recent `ends_at` date
 *
 * Returns null if no eligible subscription exists.
 */
export function getLastEndedPaidSubscription(
  subs: Subscription[],
): Subscription | null {
  return (
    subs
      .filter(isInactive)
      .sort(
        (a, b) =>
          new Date(b.ends_at!).getTime() - new Date(a.ends_at!).getTime(),
      )[0] ?? null
  )
}

/**
 * Computes a user-facing timeline event for a subscription, if applicable.
 *
 * Timeline events represent meaningful access changes, such as:
 * - Trial ending
 * - Subscription renewal
 * - Access ending or having ended
 *
 * Returns:
 * - An object containing a label and date if a timeline event exists
 * - null if no user-visible timeline is relevant
 */
export function getSubscriptionTimeline(
  sub: Subscription,
): { label: string; date: string } | null {
  // Access continues, but something will happen in the future
  if (sub.renews_at && (sub.status === 'active' || sub.status === 'on_trial')) {
    return {
      label: sub.status === 'on_trial' ? 'Trial ends' : 'Renews',
      date: sub.renews_at,
    }
  }

  // Dunning: access still exists, but will end if payment isn't resolved
  if (sub.status === 'unpaid' && sub.ends_at) {
    return {
      label: 'Payment required — access ends',
      date: sub.ends_at,
    }
  }

  // Access has ended or is scheduled to end
  if ((sub.status === 'cancelled' || sub.status === 'expired') && sub.ends_at) {
    return {
      label: sub.status === 'expired' ? 'Access ended' : 'Access ends',
      date: sub.ends_at,
    }
  }

  return null
}

/**
 * Returns Tailwind utility classes for styling subscription status badges.
 *
 * This function is purely visual.
 */
export function getStatusBadgeClass(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
    case 'on_trial':
      return 'bg-green-500/10 text-green-700 border-green-600/20'

    case 'paused':
    case 'past_due':
    case 'unpaid':
      return 'bg-orange-500/10 text-orange-700 border-orange-600/20'

    case 'expired':
    case 'cancelled':
      return 'bg-red-500/10 text-red-700 border-red-600/20'

    default:
      return ''
  }
}
