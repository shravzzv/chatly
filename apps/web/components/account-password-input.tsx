'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useNetworkContext } from '@/providers/network-provider'
import { createClient } from '@/utils/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeClosed } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from './ui/button'
import { Field, FieldError } from './ui/field'
import { Label } from './ui/label'
import { Spinner } from './ui/spinner'

const passwordSchema = z.object({
  password: z
    .string('Password is requried')
    .min(8, 'Password must be at least 8 characters long')
    .trim(),
})

export default function AccountPasswordInput() {
  const [isVisible, setIsVisible] = useState(false)
  const { isOnline } = useNetworkContext()

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  })

  const {
    formState: { isDirty, isSubmitting },
  } = form

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      form.setError('password', {
        type: 'server',
        message: error.message,
      })

      toast.error('Failed to update password')
      return
    }

    form.reset()
    toast.success('Password updated successfully')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
      <Controller
        name='password'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <InputGroup>
              <InputGroupInput
                {...field}
                id='password'
                type={isVisible ? 'text' : 'password'}
                placeholder='••••••••'
                autoComplete='new-password'
                aria-invalid={fieldState.invalid}
                disabled={!isOnline}
              />
              <InputGroupAddon align='block-start'>
                <Label htmlFor='password' className='text-foreground'>
                  Password
                </Label>
                <InputGroupButton
                  size='icon-xs'
                  className='cursor-pointer'
                  type='button'
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? <EyeClosed /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <p className='text-muted-foreground text-xs'>
        Changing your password will sign you out of other sessions.
      </p>

      <Field>
        <Button
          type='submit'
          className='max-w-fit cursor-pointer'
          disabled={!isDirty || isSubmitting || !isOnline}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              Updating...
            </>
          ) : (
            'Update password'
          )}
        </Button>
      </Field>
    </form>
  )
}
