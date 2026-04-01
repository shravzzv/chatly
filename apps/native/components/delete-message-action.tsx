import { Trash } from 'lucide-react-native'
import { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface DeleteMessageActionProps {
  id: string
}

export default function DeleteMessageAction({ id }: DeleteMessageActionProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    console.log(`delete message with id ${id}`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Icon as={Trash} className='size-4 text-muted-foreground' />
        </Button>
      </DialogTrigger>

      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Delete message?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            message from the chat.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose className='cursor-pointer' asChild>
            <Button variant='outline'>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>

          <Button className='cursor-pointer' onPress={handleDelete}>
            <Text>Continue</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
