import { Info, RotateCw } from 'lucide-react-native'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface MessageAttachmentAlertProps {
  attachmentKind: string
  onRetry: () => Promise<void>
}

export default function MessageAttachmentAlert({
  attachmentKind,
  onRetry,
}: MessageAttachmentAlertProps) {
  return (
    <Alert
      icon={Info}
      variant='destructive'
      className='max-w-2xs space-y-1 rounded-2xl'
    >
      <AlertTitle className='font-medium'>
        Failed to load {attachmentKind}
      </AlertTitle>

      <AlertDescription className='flex items-center gap-2'>
        <Text className='text-xs text-muted-foreground'>
          This attachment couldn&apos;t be loaded.
        </Text>
      </AlertDescription>

      <Button
        size='sm'
        variant='outline'
        onPress={onRetry}
        className='cursor-pointer text-foreground'
      >
        <Icon as={RotateCw} className='size-3' />
        <Text className='text-xs'>Retry</Text>
      </Button>
    </Alert>
  )
}
