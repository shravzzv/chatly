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
import signupBanner from '@/public/signup banner.jpg'
import Image from 'next/image'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState } from 'react'
import { Spinner } from './ui/spinner'
import { signup } from '@/app/actions'
import GitHubAuthForm from './github-auth-form'
import GoogleAuthForm from './google-auth-form'
import AppleAuthForm from './apple-auth-form'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { CheckCircle2Icon } from 'lucide-react'

const formSchema = z
  .object({
    email: z.email('Email is required').trim(),
    password: z
      .string('Password is requried')
      .min(8, 'Password must be at least 8 characters long')
      .trim(),
    confirmPassword: z
      .string('Confirm password is required')
      .min(8, 'Confirm password must be at least 8 characters long')
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    await signup(formData)

    setLoading(false)
    setMessage(
      `Almost there! If this email isn't already registered, you'll receive a confirmation link shortly. Please check your inbox (and spam folder) to confirm your account.`
    )
    form.reset()
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <div className='p-6 md:p-8'>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <h1 className='text-2xl font-bold'>Create your account</h1>
                  <p className='text-muted-foreground text-sm text-balance'>
                    Enter your email below to create your account
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
                      <FieldDescription>
                        We&apos;ll use this to contact you. We will not share
                        your email with anyone else.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field className='grid grid-cols-2 gap-4'>
                  <Controller
                    name='password'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type='password'
                          aria-invalid={fieldState.invalid}
                          autoComplete='new-password'
                        />
                        <FieldDescription>
                          Must be at least 8 characters long.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name='confirmPassword'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Confirm Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type='password'
                          aria-invalid={fieldState.invalid}
                          autoComplete='new-password'
                        />
                        <FieldDescription>
                          Must match the password.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </Field>

                {message && (
                  <Alert>
                    <CheckCircle2Icon className='h-4 w-4' />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
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
                        <Spinner />
                        Creating Account
                      </>
                    ) : (
                      'Create Account'
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
              Already have an account? <Link href='/signin'>Sign in</Link>
            </FieldDescription>
          </div>

          <div className='bg-muted relative hidden md:block'>
            <Image
              src={signupBanner}
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover'
              priority
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className='px-6 text-center'>
        By clicking continue, you agree to our{' '}
        <Link href='#'>Terms of Service</Link> and{' '}
        <Link href='#'>Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
