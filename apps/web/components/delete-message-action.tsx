'use client'

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
import { useDashboardContext } from '@/providers/dashboard-provider'

interface DeleteMessageActionProps {
  id: string
}

export default function DeleteMessageAction({ id }: DeleteMessageActionProps) {
  const { deleteMessage } = useDashboardContext()

  return (
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
            onClick={() => deleteMessage(id)}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
