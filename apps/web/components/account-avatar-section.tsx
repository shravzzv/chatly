'use client'

import { Label } from '@/components/ui/label'
import { Pen } from 'lucide-react'
import ProfileAvatar from './profile-avatar'
import { Profile } from '@/types/profile'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'
import { Spinner } from './ui/spinner'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { v4 } from 'uuid'

interface AccountAvatarSectionProps {
  profile: Profile
}

export default function AccountAvatarSection({
  profile,
}: AccountAvatarSectionProps) {
  const [loading, setLoading] = useState(false)
  const setProfile = useChatlyStore((state) => state.setProfile)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${profile.user_id}/avatar`, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${profile.user_id}/avatar`)

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${data.publicUrl}?v=${v4()}` })
        .eq('user_id', profile.user_id)
        .select()
        .single()

      if (updateError) throw updateError

      toast.success('Avatar updated successfully')
      setProfile(updatedProfile)
    } catch (error) {
      toast.error('Upload failed')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center gap-4'>
      <input
        id='avatar'
        type='file'
        accept='image/*'
        className='sr-only'
        onChange={handleChange}
        disabled={loading}
      />

      <Label
        htmlFor='avatar'
        className={`relative cursor-pointer group shrink-0 transition-transform active:scale-95 ${
          loading ? 'cursor-not-allowed' : ''
        }`}
      >
        <div className={loading ? 'opacity-50 grayscale-[0.5]' : ''}>
          <ProfileAvatar profile={profile} height={24} width={24} />
        </div>

        {/* Overlay UI */}
        <div
          className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
            loading
              ? 'bg-black/20 opacity-100'
              : 'bg-black/40 opacity-0 group-hover:opacity-100'
          }`}
        >
          {loading ? (
            <Spinner className='w-8 h-8 text-white' />
          ) : (
            <div className='flex flex-col items-center text-white gap-1'>
              <Pen className='w-5 h-5' />
              <span className='text-[10px] font-medium uppercase tracking-wider'>
                Edit
              </span>
            </div>
          )}
        </div>
      </Label>

      <div className='flex flex-col gap-1'>
        <h3 className='text-sm font-medium'>Profile Picture</h3>
        <p className='text-xs text-muted-foreground'>
          {loading ? 'Uploading your new look...' : 'JPG, PNG or GIF. Max 5MB.'}
        </p>
      </div>
    </div>
  )
}
