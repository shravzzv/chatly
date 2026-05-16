import { supabase } from './supabase.ts'

export const upload = async (userId: string, blob: Blob) => {
  const { error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/avatar`, blob, {
      upsert: true,
      contentType: blob.type ?? 'image/jpeg',
    })

  if (error) {
    throw error
  }
}
