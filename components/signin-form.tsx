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
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import signinBanner from '@/public/signin-banner.jpg'
import Image from 'next/image'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState } from 'react'
import { Spinner } from './ui/spinner'
import { signin } from '@/app/actions'
import GoogleAuthForm from './google-auth-form'
import GitHubAuthForm from './github-auth-form'
import AppleAuthForm from './apple-auth-form'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircleIcon } from 'lucide-react'

const formSchema = z.object({
  email: z.email('Email is required').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await signin(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <div className='p-6 md:p-8'>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <h1 className='text-2xl font-bold'>Welcome back</h1>
                  <p className='text-muted-foreground text-balance'>
                    Login to your Chatly account
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
                        placeholder='m@example.com'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name='password'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className='flex items-center'>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Link
                          href='/forgot-password'
                          className='ml-auto text-sm underline-offset-2 hover:underline'
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <Input {...field} id={field.name} type='password' />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {error && (
                  <Alert variant='destructive'>
                    <AlertCircleIcon className='h-4 w-4' />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <Button
                    type='submit'
                    className='cursor-pointer'
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner /> Signing in
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </Field>

                <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
                  Or continue with
                </FieldSeparator>
              </FieldGroup>
            </form>

            <div className='grid grid-cols-3 gap-4 my-6'>
              <GoogleAuthForm />
              <GitHubAuthForm />
              <AppleAuthForm />
            </div>

            <FieldDescription className='text-center mt-6'>
              Don&apos;t have an account? <Link href='/signup'>Sign up</Link>
            </FieldDescription>
          </div>

          <div className='bg-muted relative hidden md:block'>
            <Image
              src={signinBanner}
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover'
              priority
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className='px-6 text-center'>
        By clicking continue, you agree to our{' '}
        <Link href='/tos'>Terms of Service</Link> and{' '}
        <Link href='/privacy'>Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
