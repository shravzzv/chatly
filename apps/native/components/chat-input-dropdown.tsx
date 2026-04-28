import { usePrivateContext } from '@/providers/private-provider'
import type { NativeFile } from '@/types/use-messages'
import { PLAN_LIMITS } from '@chatly/lib/billing'
import type { MessageAttachmentKind } from '@chatly/types/message-attachment'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import {
  AudioLines,
  BookAudio,
  Camera,
  FilePlay,
  Image,
  ImagePlus,
  Mic,
  Paperclip,
  Plus,
  Video,
} from 'lucide-react-native'
import { useState } from 'react'
import { toast } from 'sonner-native'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface ChatInputDropdownProps {
  openVoiceRecorder: () => void
}

export const MAX_MESSAGE_ATTACHMENT_SIZE = 50 * 1024 * 1024 // 50MB

export default function ChatInputDropdown({
  openVoiceRecorder,
}: ChatInputDropdownProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { canUseMedia, mediaUsed, plan, sendMessage, reflectUsageIncrement } =
    usePrivateContext()

  type Asset =
    | File
    | ImagePicker.ImagePickerAsset
    | DocumentPicker.DocumentPickerAsset

  const getUploadableFile = async (
    asset: Asset,
    kind: MessageAttachmentKind,
  ): Promise<File | NativeFile> => {
    // Web cases
    if (asset instanceof File) return asset
    if ('file' in asset && asset.file) return asset.file

    // Native case
    const arrayBuffer = await fetch(asset.uri).then((res) => res.arrayBuffer())

    const mimeType =
      'mimeType' in asset && asset.mimeType
        ? asset.mimeType
        : kind === 'video'
          ? 'video/mp4'
          : kind === 'audio'
            ? 'audio/mpeg'
            : kind === 'image'
              ? 'image/jpeg'
              : 'application/octet-stream'

    const name =
      'fileName' in asset && asset.fileName
        ? asset.fileName
        : 'name' in asset && asset.name
          ? asset.name
          : `${kind}_${Date.now()}.${mimeType.split('/')[1]}`

    return {
      arrayBuffer,
      mimeType,
      name,
      size: arrayBuffer.byteLength,
    }
  }

  const validateFile = (
    file: File | NativeFile,
    kind: MessageAttachmentKind,
  ) => {
    const size = file instanceof File ? file.size : file.arrayBuffer.byteLength
    const mime = file instanceof File ? file.type : file.mimeType

    if (kind !== 'file' && !mime.startsWith(kind)) {
      throw Error('INVALID_FILE_TYPE')
    }

    if (size > MAX_MESSAGE_ATTACHMENT_SIZE) {
      throw Error('FILE_TOO_LARGE')
    }
  }

  const handleSubmit = async (asset: Asset, kind: MessageAttachmentKind) => {
    if (isUploading) return

    try {
      const file = await getUploadableFile(asset, kind)
      validateFile(file, kind)
      setIsUploading(true)

      await sendMessage({ file })
      reflectUsageIncrement('media')
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_FILE_TYPE':
            toast.error(`Please upload a valid ${kind} file`)
            break

          case 'FILE_TOO_LARGE':
            toast.error('File must be at most 50 MB')
            break

          case 'USER_ON_FREE_PLAN':
            toast.error('Upgrade your plan to send media attachments')
            break

          case 'USAGE_LIMIT_EXCEEDED':
            toast.error('Daily media attachments limit reached')
            break

          default:
            toast.error('Upload failed')
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      toast.info('Camera permission is required')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
    })

    if (!result.canceled) {
      await handleSubmit(result.assets[0], 'image')
    }
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      toast.info('Image permissions are required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
    })

    if (!result.canceled) {
      await handleSubmit(result.assets[0], 'image')
    }
  }

  const takeVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      toast.info('Video permission is required')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'videos',
      allowsEditing: false,
      quality: 1,
    })

    if (!result.canceled) {
      await handleSubmit(result.assets[0], 'video')
    }
  }

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      toast.info('Video permissions are required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
    })

    if (!result.canceled) {
      await handleSubmit(result.assets[0], 'video')
    }
  }

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' })

    if (!result.canceled) {
      await handleSubmit(result.assets[0], 'audio')
    }
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync()

    if (!result.canceled) {
      await handleSubmit(result.assets[0], 'file')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isUploading}>
        <Button
          variant='secondary'
          size='icon'
          className='mb-1 shrink-0 rounded-full'
        >
          <Icon as={Plus} className='size-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' side='top'>
        <DropdownMenuLabel>
          <Text className='text-xs text-muted-foreground'>Attachments</Text>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {canUseMedia && (
          <>
            <DropdownMenuLabel>
              <Text className='text-xs text-muted-foreground'>
                {mediaUsed}/{PLAN_LIMITS[plan].media} today
              </Text>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className='flex cursor-pointer items-center gap-2'
            disabled={isUploading}
          >
            <Icon as={ImagePlus} className='size-4 text-muted-foreground' />
            <Text>Image</Text>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent disabled={isUploading}>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={takePhoto}
              disabled={isUploading}
            >
              <Icon as={Camera} className='size-4 text-muted-foreground' />
              <Text>Camera</Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={pickImage}
              disabled={isUploading}
            >
              <Icon as={Image} className='size-4 text-muted-foreground' />
              <Text>File</Text>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className='flex cursor-pointer items-center gap-2'
            disabled={isUploading}
          >
            <Icon as={Video} className='size-4 text-muted-foreground' />
            <Text>Video</Text>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={takeVideo}
              disabled={isUploading}
            >
              <Icon as={Video} className='size-4 text-muted-foreground' />
              <Text>Record</Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={pickVideo}
              disabled={isUploading}
            >
              <Icon as={FilePlay} className='size-4 text-muted-foreground' />
              <Text>File</Text>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className='flex cursor-pointer items-center gap-2'
            disabled={isUploading}
          >
            <Icon as={AudioLines} className='size-4 text-muted-foreground' />
            <Text>Audio</Text>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={openVoiceRecorder}
              disabled={isUploading}
            >
              <Icon as={Mic} className='size-4 text-muted-foreground' />
              <Text>Record</Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={pickAudio}
              disabled={isUploading}
            >
              <Icon as={BookAudio} className='size-4 text-muted-foreground' />
              <Text>File</Text>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          className='flex cursor-pointer items-center gap-2'
          onPress={pickFile}
          disabled={isUploading}
        >
          <Icon as={Paperclip} className='size-4 text-muted-foreground' />
          <Text>File</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
