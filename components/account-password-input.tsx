'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from './ui/label'
import { Eye, EyeClosed } from 'lucide-react'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError } from './ui/field'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Spinner } from './ui/spinner'

const passwordSchema = z.object({
  password: z
    .string('Password is requried')
    .min(8, 'Password must be at least 8 characters long')
    .trim(),
})

export default function AccountPasswordInput() {
  const [isVisible, setIsVisible] = useState(false)

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

      <p className='text-xs text-muted-foreground'>
        Changing your password will sign you out of other sessions.
      </p>

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
            'Update password'
          )}
        </Button>
      </Field>
    </form>
  )
}
