import { supabase } from "./supabase.ts";
import { parseVariant } from "./parse-variant.ts";
/**
 * Handle subscription_updated
 *
 * Mirrors all subscription changes from LS → Supabase.
 * This keeps your local subscription record fully in sync.
 */ export async function handleSubscriptionUpdated(payload) {
  const userId = payload.meta.custom_data?.user_id;
  if (!userId) {
    console.error("subscription_updated missing custom user_id");
    return;
  }
  const attributes = payload.data.attributes;
  const { plan, billing } = parseVariant(attributes.variant_name);
  const updates = {
    user_id: userId,
    ls_subscription_id: payload.data.id,
    ls_customer_id: payload.data.attributes.customer_id,
    plan,
    billing,
    status: attributes.status,
    renews_at: attributes.renews_at,
    ends_at: attributes.ends_at
  };
  const { error } = await supabase.from("subscriptions").upsert(updates, {
    onConflict: "ls_subscription_id"
  });
  if (error) {
      // Expected: webhook for a deleted user
  if (error.code === "23503") {
    console.info(
      "Ignoring subscription update for deleted user",
      {
        user_id: userId,
        ls_subscription_id: payload.data.id,
        status: attributes.status,
      }
    );
    return;
  }
  // Unexpected errors
  console.error("Failed to upsert subscription (updated):", error);
  return;
  }
  
  console.log(`Subscription updated for user ${userId} → { plan: ${plan}, billing: ${billing}, status: ${attributes.status} }`);
}
