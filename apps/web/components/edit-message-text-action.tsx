'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDashboardContext } from '@/providers/dashboard-provider'
import { useNetworkContext } from '@/providers/network-provider'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import EditMessageForm from './edit-message-form'
import { Button } from './ui/button'

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
  const { isOnline } = useNetworkContext()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon-sm'
          className='text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed'
          disabled={!isOnline}
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
