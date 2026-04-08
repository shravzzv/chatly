import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Text } from './ui/text'

interface DeleteMessageActionProps {
  id: string
  open: boolean
  setOpen: (value: boolean) => void
}

export default function DeleteMessageAction({
  id,
  open,
  setOpen,
}: DeleteMessageActionProps) {
  const handleDelete = () => {
    console.log(`deleted message with id ${id}`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
