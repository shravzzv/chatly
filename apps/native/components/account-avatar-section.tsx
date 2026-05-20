import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { NativeFile } from '@chatly/types/native-file'
import type { Profile } from '@chatly/types/profile'
import * as Crypto from 'expo-crypto'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import { toast } from 'sonner-native'
import { Spinner } from './ui/spinner'

interface AccountAvatarSectionProps {
  profile: Profile
}

export default function AccountAvatarSection({
  profile,
}: AccountAvatarSectionProps) {
  const [loading, setLoading] = useState(false)

  const uploadAvatar = async (file: File | NativeFile) => {
    try {
      const size =
        file instanceof File ? file.size : file.arrayBuffer.byteLength

      if (size > 5 * 1024 * 1024) throw Error('FILE_TOO_LARGE')

      if (!supabase) return
      setLoading(true)

      const isNativeFileUpload = !(file instanceof File)
      const path = `${profile.user_id}/avatar`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, isNativeFileUpload ? file.arrayBuffer : file, {
          upsert: true,
          contentType: isNativeFileUpload ? file.mimeType : file.type,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${profile.user_id}/avatar`)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${data.publicUrl}?v=${Crypto.randomUUID()}` })
        .eq('user_id', profile.user_id)
        .select()
        .single()

      if (updateError) throw updateError

      toast.success('Avatar updated successfully')
    } catch (error) {
      console.error('Error uploading avatar', error)

      if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
        toast.error('File must be at most 50 MB')
        return
      }

      toast.error('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const getUploadableFile = async (
    asset: File | ImagePicker.ImagePickerAsset,
  ): Promise<File | NativeFile> => {
    // Web case
    if (asset instanceof File) return asset
    if ('file' in asset && asset.file) return asset.file

    // Native case
    const arrayBuffer = await fetch(asset.uri).then((res) => res.arrayBuffer())

    const mimeType = asset.mimeType || 'image/jpeg'
    const name =
      'fileName' in asset && asset.fileName
        ? asset.fileName
        : `image_${Date.now()}.${mimeType.split('/')[1]}`

    return {
      arrayBuffer,
      mimeType,
      name,
      size: arrayBuffer.byteLength,
    }
  }

  const handlePickImage = async () => {
    if (loading) return

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      toast.info('Image permissions are required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
    })

    if (!result.canceled) {
      const asset = result.assets[0]
      const file = await getUploadableFile(asset)
      await uploadAvatar(file)
    }
  }

  return (
    <View className='my-4 flex-row items-center gap-4'>
      <Pressable
        onPress={handlePickImage}
        disabled={loading}
        className={cn('relative', loading && 'cursor-not-allowed')}
      >
        <Image
          source={{
            uri: profile.avatar_url ?? '',
          }}
          alt='avatar'
          className={cn(
            `size-24 shrink-0 rounded-full`,
            loading && 'opacity-50 grayscale-[0.5]',
          )}
        />

        {loading && (
          <View
            pointerEvents='none'
            className='absolute inset-0 items-center justify-center rounded-full bg-black/20'
          >
            <Spinner className='size-5 text-white' />
          </View>
        )}
      </Pressable>

      <View className='flex-1'>
        <Text className='font-bold'>Profile Picture</Text>
        <Text className='text-xs text-muted-foreground'>
          {loading
            ? 'Uploading your new look...'
            : 'JPG, PNG or GIF. Max 5MB. Click the image to update.'}
        </Text>
      </View>
    </View>
  )
}
