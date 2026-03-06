import { supabaseAdmin } from './supabase'

interface SeedUsageInput {
  userId: string
  kind: 'ai' | 'media'
  used: number
}

export async function seedUsage({
  userId,
  kind,
  used,
}: SeedUsageInput): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  const { error } = await supabaseAdmin.from('usage_windows').upsert(
    {
      user_id: userId,
      window_date: today,
      ai_used: kind === 'ai' ? used : 0,
      media_used: kind === 'media' ? used : 0,
    },
    {
      onConflict: 'user_id,window_date',
    },
  )

  if (error) {
    throw new Error(`Failed to seed usage: ${error.message}`)
  }
}
