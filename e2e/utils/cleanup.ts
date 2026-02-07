import { supabaseAdmin } from './supabase'

/**
 * Cleans up all test users and their dependent data.
 *
 * This helper ensures database integrity by:
 * 1. Removing subscription records first (to satisfy FK constraints)
 * 2. Deleting the corresponding Supabase Auth users
 *
 * It is designed to be called in `afterEach` hooks to prevent
 * test pollution across environments and runs.
 */
export async function cleanupUsers(userIds: string[]) {
  // 1. Usage windows (rate limits)
  await cleanupUsage(userIds)

  // 2. Subscriptions (FK-safe)
  await cleanupSubscriptions(userIds)

  // 3. Auth users
  for (const id of userIds) {
    await supabaseAdmin.auth.admin.deleteUser(id)
  }
}

/**
 * Removes all subscription records associated with the given users.
 *
 * This is separated from `cleanupUsers` so it can be reused independently
 * in tests that only manipulate billing state.
 *
 * Throws if deletion fails to avoid leaving orphaned test data.
 */
async function cleanupSubscriptions(userIds: string[]) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .delete()
    .in('user_id', userIds)

  if (error) {
    throw Error(`Failed to cleanup subscriptions: ${error.message}`)
  }
}

async function cleanupUsage(userIds: string[]) {
  const { error } = await supabaseAdmin
    .from('usage_windows')
    .delete()
    .in('user_id', userIds)

  if (error) {
    throw Error(`Failed to cleanup usage: ${error.message}`)
  }
}
