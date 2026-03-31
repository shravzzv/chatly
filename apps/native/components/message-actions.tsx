import { Message } from '@/types/message'
import { Download, Pen, Trash } from 'lucide-react-native'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

interface MessageActionsProps {
  message: Message
  isOwn: boolean
}

export default function MessageActions({
  message,
  isOwn,
}: MessageActionsProps) {
  const { text } = message

  const showEdit = isOwn && text && !message.attachment
  const showDelete = isOwn
  const showDownload = !text && message.attachment

  return (
    <View className='flex-row items-center'>
      {showEdit && (
        <Button variant='ghost' size='icon' className='p-0'>
          <Icon as={Pen} className='size-4 text-muted-foreground' />
        </Button>
      )}

      {showDelete && (
        <Button variant='ghost' size='icon'>
          <Icon as={Trash} className='size-4 text-muted-foreground' />
        </Button>
      )}

      {showDownload && (
        <Button variant='ghost' size='icon'>
          <Icon as={Download} className='size-4 text-muted-foreground' />
        </Button>
      )}
    </View>
  )
}
