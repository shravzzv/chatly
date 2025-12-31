import { supabaseAdmin } from './supabase'

export async function cleanupUsers(userIds: string[]) {
  for (const id of userIds) {
    await supabaseAdmin.auth.admin.deleteUser(id)
  }
}
