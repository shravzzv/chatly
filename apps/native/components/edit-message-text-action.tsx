import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pen, Sparkles } from 'lucide-react-native'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Platform, View } from 'react-native'
import * as z from 'zod'
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
import { Spinner } from './ui/spinner'
import { Text } from './ui/text'
import { Textarea } from './ui/textarea'

interface EditMessageTextActionProps {
  id: string
  text: string
}

const formSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty'),
})

type FormSchema = z.infer<typeof formSchema>

export default function EditMessageTextAction({
  id,
  text,
}: EditMessageTextActionProps) {
  const [open, setOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { text },
  })

  const onSubmit = (data: FormSchema) => {
    console.log(data.text)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon' className='p-0'>
          <Icon as={Pen} className='size-4 text-muted-foreground' />
        </Button>
      </DialogTrigger>

      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit message</DialogTitle>

          <DialogDescription>
            Correct a typo or update your thoughts. Your message history will
            reflect that an edit was made.
          </DialogDescription>
        </DialogHeader>

        <Controller
          name='text'
          control={control}
          render={({ field }) => (
            <View className='gap-2'>
              <View
                className={cn(
                  'flex-row items-end gap-2 rounded-lg border border-border p-1',
                  errors.text && 'border-destructive',
                )}
              >
                <Textarea
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder='Type a message...'
                  editable={!isSubmitting}
                  numberOfLines={Platform.select({ web: 4, native: 5 })}
                  className='min-h-1 flex-1 resize-none border-0 border-none text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 active:outline-none dark:bg-transparent'
                />

                <Button
                  size='icon'
                  variant='secondary'
                  className='shrink-0 rounded-full'
                  disabled={!field.value}
                >
                  <Icon as={Sparkles} />
                </Button>
              </View>

              {errors.text && (
                <Text
                  variant='small'
                  className='leading-relaxed text-destructive'
                >
                  {errors.text.message}
                </Text>
              )}
            </View>
          )}
        />

        <DialogFooter>
          <DialogClose className='cursor-pointer' asChild>
            <Button variant='outline'>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>

          <Button
            className='cursor-pointer disabled:cursor-not-allowed'
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className='text-primary-foreground' />
                <Text>Saving...</Text>
              </>
            ) : (
              <Text>Save changes</Text>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
