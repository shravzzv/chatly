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
    <Alert variant='destructive' className='rounded-2xl max-w-2xs space-y-1'>
      <AlertCircleIcon className='h-4 w-4 mt-0.5 shrink-0' />

      <AlertTitle className='font-medium'>
        Failed to load {attachmentKind}
      </AlertTitle>

      <AlertDescription className='flex items-center gap-2'>
        <span className='text-xs text-muted-foreground'>
          This attachment couldn&apos;t be loaded.
        </span>

        <Button
          size='xs'
          variant='outline'
          onClick={onRetry}
          className='cursor-pointer text-foreground'
        >
          <RotateCw />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}
