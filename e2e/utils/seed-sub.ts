import { randomUUID } from 'crypto'
import { supabaseAdmin } from './supabase'
import type { Subscription, SubscriptionStatus } from '@/types/subscription'

interface SeedSubscriptionInput {
  userId: string
  plan: Subscription['plan']
  status: SubscriptionStatus
  billing?: Subscription['billing']
  endsAt?: string | null
  renewsAt?: string | null
}

/**
 * Inserts a realistic subscription row directly into the database.
 *
 * This represents the *post-webhook* state that the UI consumes.
 * It intentionally bypasses Lemon Squeezy and webhook logic.
 */
export async function seedSubscription({
  userId,
  plan,
  status,
  billing = 'monthly',
  endsAt = null,
  renewsAt = null,
}: SeedSubscriptionInput) {
  const now = new Date().toISOString()

  const record: Omit<Subscription, 'id'> = {
    user_id: userId,
    plan,
    billing,
    status,
    ls_subscription_id: `test_sub_${randomUUID()}`,
    ls_customer_id: `test_cust_${randomUUID()}`,
    ends_at: endsAt,
    renews_at: renewsAt,
    created_at: now,
    updated_at: now,
  }

  const { error } = await supabaseAdmin.from('subscriptions').insert(record)

  if (error) {
    throw new Error(`Failed to seed subscription: ${error.message}`)
  }
}
