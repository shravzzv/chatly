import { AlertCircleIcon, RotateCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

interface MessageAttachmentAlertProps {
  attachmentKind: string
  onRetry: () => Promise<void>
}

export default function MessageAttachmentAlert({
  attachmentKind,
  onRetry,
}: MessageAttachmentAlertProps) {
  return (
    <Alert variant='destructive' className='max-w-2xs space-y-1 rounded-2xl'>
      <AlertCircleIcon className='mt-0.5 h-4 w-4 shrink-0' />

      <AlertTitle className='font-medium'>
        Failed to load {attachmentKind}
      </AlertTitle>

      <AlertDescription className='flex items-center gap-2'>
        <span className='text-muted-foreground text-xs'>
          This attachment couldn&apos;t be loaded.
        </span>

        <Button
          size='xs'
          variant='outline'
          onClick={onRetry}
          className='text-foreground cursor-pointer'
        >
          <RotateCw />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}
