/**
 * Convert LS variant names into plan + billing.
 * Example inputs:
 *   "Chatly Pro – Monthly"
 *   "Chatly Pro – "Yearly
 *   "Chatly Enterprise – Monthly"
 *   "Chatly Enterprise – Yearly"
 */ export function parseVariant(variantName) {
  const lower = variantName.toLowerCase();
  const plan = lower.includes("enterprise") ? "enterprise" : "pro";
  const billing = lower.includes("yearly") ? "yearly" : "monthly";
  return {
    plan,
    billing
  };
}
