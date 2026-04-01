import { Message } from '@/types/message'
import { Download } from 'lucide-react-native'
import { View } from 'react-native'
import DeleteMessageAction from './delete-message-action'
import EditMessageTextAction from './edit-message-text-action'
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
  const { id, text } = message

  const showEdit = isOwn && text && !message.attachment
  const showDelete = isOwn
  const showDownload = !text && message.attachment

  return (
    <View className='flex-row items-center'>
      {showEdit && text && <EditMessageTextAction id={id} text={text} />}
      {showDelete && <DeleteMessageAction id={id} />}

      {showDownload && (
        <Button variant='ghost' size='icon'>
          <Icon as={Download} className='size-4 text-muted-foreground' />
        </Button>
      )}
    </View>
  )
}
