import { Message } from '@/types/message'
import { Download, Pen } from 'lucide-react-native'
import { View } from 'react-native'
import DeleteMessageAction from './delete-message-action'
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

      {showDelete && <DeleteMessageAction id={message.id} />}

      {showDownload && (
        <Button variant='ghost' size='icon'>
          <Icon as={Download} className='size-4 text-muted-foreground' />
        </Button>
      )}
    </View>
  )
}
