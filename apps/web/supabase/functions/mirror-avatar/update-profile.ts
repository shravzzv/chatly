import { supabase } from './supabase.ts'

export const updateProfile = async (userId: string) => {
  const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar`)

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}