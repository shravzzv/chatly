import { Message } from '@/types/message'
import { View } from 'react-native'
import { Text } from './ui/text'

interface MessageMetadataProps {
  message: Message
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const formatEditedTimestamp = (createdAt: string, updatedAt: string) => {
  const created = new Date(createdAt)
  const updated = new Date(updatedAt)

  // Same day → time only
  if (isSameDay(created, updated)) {
    return updated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Different day → date + time
  return updated.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageMetadata({ message }: MessageMetadataProps) {
  const { created_at, updated_at } = message

  const createdTime = new Date(created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasMeaningfulEdit =
    new Date(updated_at).getTime() - new Date(created_at).getTime() > 60000

  return (
    <View className='flex-row items-center gap-1'>
      <Text className='text-[10px] text-muted-foreground'>{createdTime}</Text>

      {hasMeaningfulEdit && (
        <Text className='text-[10px] text-muted-foreground'>
          (edited {formatEditedTimestamp(created_at, updated_at)})
        </Text>
      )}
    </View>
  )
}
