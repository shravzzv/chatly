export type Plan = 'pro' | 'enterprise'
export type Billing = 'monthly' | 'yearly'
export type SubscriptionStatus =
  | 'on_trial'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired'

export interface Subscription {
  id: string
  user_id: string
  ls_subscription_id: string
  plan: Plan
  billing: Billing
  status: SubscriptionStatus
  renews_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}
