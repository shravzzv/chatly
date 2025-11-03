import { Trash } from 'lucide-react'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type MessageBubbleProps = {
  id: string
  text: string
  time: string
  senderId: string
  onDelete: (id: string) => void
}

export function MessageBubble({
  id,
  text,
  time,
  senderId,
  onDelete,
}: MessageBubbleProps) {
  const isOwn = senderId === 'me'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`px-3 py-2 rounded-xl max-w-xs text-sm ${
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className='whitespace-pre-wrap'>{text}</p>
        <span className='block text-[10px] text-muted-foreground text-right mt-1'>
          {time}
        </span>
      </div>

      {isOwn && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='ghost' size='icon-sm' className='cursor-pointer'>
              <Trash />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete message?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                message from the chat.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='cursor-pointer'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className='cursor-pointer'
                onClick={() => onDelete(id)}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
