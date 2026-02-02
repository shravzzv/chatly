'use client'

import { Pencil } from 'lucide-react'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import EditMessageForm from './edit-message-form'
import { useState } from 'react'
import { useDashboardContext } from '@/providers/dashboard-provider'

interface EditMessageTextActionProps {
  id: string
  text: string
}

export default function EditMessageTextAction({
  id,
  text,
}: EditMessageTextActionProps) {
  const { editMessage } = useDashboardContext()
  const [open, setOpen] = useState(false)

  return (
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
        </AlertDialogHeader>

        <EditMessageForm
          defaultText={text}
          onSubmit={(newText) => editMessage(id, newText)}
          onClose={() => setOpen(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}
