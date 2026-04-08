import type { MessageAttachment } from '@/types/message-attachment'
import { Link } from 'expo-router'
import { Download } from 'lucide-react-native'
import { View } from 'react-native'
import FileAttachmentIcon from './file-attachment-icon'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface FileAttachmentProps {
  attachment: MessageAttachment
  signedUrl: string
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

const formatMimeType = (mimeType: string) => {
  return mimeType.split('/')[1]?.toUpperCase() ?? mimeType
}

export default function FileAttachment({
  attachment,
  signedUrl,
}: FileAttachmentProps) {
  return (
    <View className='w-full flex-row items-center gap-2 rounded-2xl border border-border px-3 py-2 md:max-w-xs'>
      <View className='h-10 w-10 shrink-0 items-center justify-center'>
        <FileAttachmentIcon mimeType={attachment.mime_type} />
      </View>

      <View className='flex-1'>
        <Text className='line-clamp-2 font-medium text-sm'>
          {attachment.file_name}
        </Text>

        <View className='shrink-0 flex-row items-center gap-1'>
          <Text className='text-xs text-muted-foreground'>
            {formatMimeType(attachment.mime_type)}
          </Text>
          <Text className='text-xs text-muted-foreground'>•</Text>
          <Text className='text-xs text-muted-foreground'>
            {formatFileSize(attachment.size)}
          </Text>
        </View>
      </View>

      <Link href={'/'} download={attachment.file_name} asChild>
        <Button
          size='icon'
          variant='outline'
          className='shrink-0 cursor-pointer'
        >
          <Icon as={Download} />
        </Button>
      </Link>
    </View>
  )
}
