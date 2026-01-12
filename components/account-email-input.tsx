'use client'

import { Button } from './ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from './ui/label'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError } from './ui/field'
import { Spinner } from './ui/spinner'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog'

const emailSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export default function AccountEmailInput() {
  const user = useChatlyStore((state) => state.user)
  const [showDialog, setShowDialog] = useState(false)

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email ?? '',
    },
  })

  useEffect(() => {
    if (!user?.email) return
    form.reset({ email: user.email })
  }, [user?.email, form])

  const {
    formState: { isDirty, isSubmitting },
  } = form

  const onSubmit = async (data: z.infer<typeof emailSchema>) => {
    const supabase = createClient()
    const emailRedirectTo = `${process.env.NEXT_PUBLIC_APP_URL_ROOT}/account`

    const { error } = await supabase.auth.updateUser(
      { email: data.email },
      { emailRedirectTo }
    )

    if (error) {
      console.error(error)
      form.setError('email', {
        type: 'server',
        message: error.message,
      })

      toast.error('Failed to update email')
      return
    }

    form.reset({ email: data.email })
    setShowDialog(true)
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id='email'
                  type='email'
                  placeholder='johndoe@mail.com'
                  autoComplete='email'
                  aria-invalid={fieldState.invalid}
                />

                <InputGroupAddon align='block-start'>
                  <Label htmlFor='email' className='text-foreground'>
                    Email
                  </Label>
                </InputGroupAddon>
              </InputGroup>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button
            type='submit'
            className='cursor-pointer max-w-fit'
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Updating...
              </>
            ) : (
              'Update email'
            )}
          </Button>
        </Field>
      </form>

      <AlertDialog
        open={showDialog}
        onOpenChange={() => setShowDialog(!showDialog)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your email</AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ve sent a confirmation link to{' '}
              <strong>{form.getValues('email')}</strong>. You can continue using
              your current email until it&apos;s confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button className='cursor-pointer'>Close</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
