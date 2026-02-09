import { cleanupSubscriptions, cleanupUsage } from './cleanup'

/**
 * Purges all billing and usage records for specific users.
 * Used to ensure a clean slate between E2E test runs.
 */
export const wipeBillingState = async (userIds: string[]) => {
  if (!userIds.length) return

  // Run in parallel for maximum speed in CI
  await Promise.all([cleanupSubscriptions(userIds), cleanupUsage(userIds)])
}
