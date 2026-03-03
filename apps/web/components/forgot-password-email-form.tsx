'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState } from 'react'
import { Spinner } from './ui/spinner'
import { sendPasswordResetEmail } from '@/app/actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2Icon, AlertCircleIcon } from 'lucide-react'

interface Message {
  type: 'success' | 'error'
  text: string
}

const formSchema = z.object({
  email: z.email('A valid email is required').trim(),
})

export function ForgotPasswordEmailForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', data.email)

    const result = await sendPasswordResetEmail(formData)
    setLoading(false)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({
        type: 'success',
        text: 'Password reset email sent successfully! Please check your inbox.',
      })
      form.reset()
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent>
          <div className='py-6 md:py-8'>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <h1 className='text-2xl font-bold'>Reset your password</h1>
                  <p className='text-muted-foreground text-sm text-balance'>
                    Enter your email below to receive a password reset link.
                  </p>
                </div>

                <Controller
                  name='email'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder='m@example.com'
                        autoComplete='on'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <Button
                    type='submit'
                    className='cursor-pointer'
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Sending Link
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </Field>

                {message && (
                  <Alert
                    variant={
                      message.type === 'error' ? 'destructive' : 'default'
                    }
                  >
                    {message.type === 'error' ? (
                      <AlertCircleIcon className='h-4 w-4' />
                    ) : (
                      <CheckCircle2Icon className='h-4 w-4' />
                    )}
                    <AlertTitle>
                      {message.type === 'error' ? 'Error' : 'Success'}
                    </AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                <FieldDescription className='text-center mt-6'>
                  Remembered your password?{' '}
                  <Link href='/signin' className='underline'>
                    Sign in
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
