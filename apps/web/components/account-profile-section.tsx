'use client'

import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { Spinner } from './ui/spinner'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import AccountAvatarSection from './account-avatar-section'
import { updateProfile } from '@/app/actions'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircleIcon } from 'lucide-react'
import { useEffect } from 'react'
import AccountProfileSectionSkeleton from './skeletons/account-profile-section-skeleton'
import { useChatlyStore } from '@/providers/chatly-store-provider'

const formSchema = z.object({
  name: z
    .string('Name is requried')
    .min(3, 'Name must be at least 3 characters long')
    .trim(),
  username: z
    .string('Username is requried')
    .min(3, 'Username must be at least 3 characters long')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores')
    .trim(),
  bio: z
    .string()
    .max(160, 'Bio must be under 160 characters')
    .trim()
    .optional(),
})

export default function AccountProfileSection() {
  const profile = useChatlyStore((state) => state.profile)
  const setProfile = useChatlyStore((state) => state.setProfile)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      bio: '',
    },
  })

  const {
    formState: { isDirty, isSubmitting },
  } = form

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const result = await updateProfile(data)

    if (!result.success) {
      toast.error('Profile update failed')

      if (result.field) {
        form.setError(result.field as keyof z.infer<typeof formSchema>, {
          type: 'server',
          message: result.message,
        })
      } else {
        form.setError('root', {
          type: 'server',
          message: result.message,
        })
      }

      return
    }

    setProfile(result.updatedProfile)
    toast.success('Profile updated successfully')
    form.reset(result.updatedProfile)
  }

  useEffect(() => {
    if (!profile) return

    form.reset({
      name: profile.name ?? '',
      username: profile.username ?? '',
      bio: profile.bio ?? '',
    })
  }, [profile, form])

  if (!profile) {
    return <AccountProfileSectionSkeleton />
  }

  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold'>Profile</h2>
      <AccountAvatarSection profile={profile} />
      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className='space-y-4 md:flex md:gap-2 md:space-y-0'>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete='on'
                    placeholder='John Doe'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='username'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-rhf-input-username'>
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-rhf-input-username'
                    aria-invalid={fieldState.invalid}
                    placeholder='johndoe'
                    autoComplete='username'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name='bio'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-rhf-textarea-about'>Bio</FieldLabel>
                <Textarea
                  {...field}
                  id='form-rhf-textarea-about'
                  aria-invalid={fieldState.invalid}
                  placeholder="I'm a software engineer..."
                  className='min-h-30'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <Alert variant='destructive'>
              <AlertCircleIcon />
              <AlertTitle>An error occured.</AlertTitle>
              <AlertDescription>
                <p>{form.formState.errors.root.message}</p>
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <Button
              type='submit'
              className='cursor-pointer max-w-fit'
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Saving
                </>
              ) : (
                'Save'
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </section>
  )
}
