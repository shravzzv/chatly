'use client'

import { Pencil, Trash } from 'lucide-react'
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
import EditMessageForm from './edit-message-form'
import { useState } from 'react'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { formatEditedTimestamp } from '@/lib/date'

interface MessageBubbleProps {
  id: string
  text: string
  sender_id: string
  created_at: string
  updated_at: string
  deleteMessage: (id: string) => Promise<void>
  editMessage: (id: string, text: string) => Promise<void>
}

export function MessageBubble({
  id,
  text,
  sender_id,
  created_at,
  updated_at,
  deleteMessage,
  editMessage,
}: MessageBubbleProps) {
  const currentUser = useChatlyStore((state) => state.user)
  const isOwn = sender_id === currentUser?.id
  const [open, setOpen] = useState(false)

  const createdTime = new Date(created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isEdited = updated_at !== created_at

  const updatedTime = isEdited
    ? formatEditedTimestamp(created_at, updated_at)
    : null

  return (
    <div
      className={`flex flex-col ${
        isOwn ? 'items-end' : 'items-start'
      } space-y-1`}
    >
      <div
        className={`px-3 py-2 rounded-xl max-w-xs text-sm ${
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className='whitespace-pre-wrap'>{text}</p>
        <span className='block text-[10px] text-muted-foreground text-right mt-1'>
          {createdTime}
          {isEdited && (
            <span className='ml-1 text-[10px] text-muted-foreground'>
              (edited {updatedTime})
            </span>
          )}
        </span>
      </div>

      {isOwn && (
        <div className='flex'>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='icon-sm'
                className='cursor-pointer text-muted-foreground hover:text-foreground'
              >
                <Pencil className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit message</AlertDialogTitle>
                <AlertDialogDescription>
                  Modify your message below and save changes.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <EditMessageForm
                defaultText={text}
                onSubmit={async (newText) => await editMessage(id, newText)}
                onClose={() => setOpen(false)}
              />
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='icon-sm'
                className='cursor-pointer text-muted-foreground hover:text-destructive'
              >
                <Trash className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your message from the chat.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='cursor-pointer'>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className='cursor-pointer'
                  onClick={async () => await deleteMessage(id)}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
