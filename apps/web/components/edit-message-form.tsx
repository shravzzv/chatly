'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { Spinner } from './ui/spinner'
import { useState } from 'react'
import { AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Textarea } from './ui/textarea'

const formSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty!'),
})

type EditMessageFormProps = {
  defaultText: string
  onSubmit: (text: string) => Promise<void> | void
  onClose: () => void
  className?: string
}

export default function EditMessageForm({
  defaultText,
  onSubmit,
  onClose,
  className,
}: EditMessageFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: defaultText },
  })

  const isDirty = form.formState.isDirty

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      await onSubmit(data.text)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn('flex flex-col gap-3', className)}
    >
      <Controller
        name='text'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Message</FieldLabel>
            <Textarea {...field} id={field.name} autoFocus />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className='flex justify-end gap-2'>
        <AlertDialogCancel asChild>
          <Button
            type='button'
            variant='outline'
            className='cursor-pointer'
            disabled={loading}
          >
            Cancel
          </Button>
        </AlertDialogCancel>

        <Button
          type='submit'
          disabled={loading || !isDirty}
          className='cursor-pointer'
        >
          {loading ? (
            <>
              <Spinner className='mr-2' /> Saving
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </form>
  )
}
