import { supabase } from './supabase.ts';
import { parseVariant } from "./parse-variant.ts";
/**
 * Handle subscription_created event.
 * Creates or upserts a subscription row.
 */ export async function handleSubscriptionCreated(payload) {
  const userId = payload.meta.custom_data?.user_id;
  if (!userId) {
    console.error("subscription_created missing custom user_id");
    return;
  }
  const attributes = payload.data.attributes;
  const { plan, billing } = parseVariant(attributes.variant_name);
  const newSub = {
    user_id: userId,
    ls_subscription_id: payload.data.id,
    ls_customer_id: payload.data.attributes.customer_id,
    plan,
    billing,
    status: attributes.status,
    renews_at: attributes.renews_at,
    ends_at: attributes.ends_at
  }
  const { error } = await supabase.from("subscriptions").insert(newSub);
  if (error) {
    console.error("Failed to insert subscription:", error);
    return;
  }
  console.log(`Subscription created for user ${userId} (${plan} ${billing})`);
}
