import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Profile } from '@chatly/types/profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon } from 'lucide-react-native'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import * as z from 'zod'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Spinner } from './ui/spinner'
import { Text } from './ui/text'
import { Textarea } from './ui/textarea'

async function updateProfile(updates: Partial<Profile>) {
  if (!supabase) return

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error

    return { success: true, updatedProfile }
  } catch (error) {
    console.error('update profile error:', error)

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return {
        success: false,
        field: 'username',
        message: 'This username is already taken',
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An Unknown server error occured',
    }
  }
}

const formSchema = z.object({
  name: z
    .string('Name is requried')
    .min(3, 'Name must be at least 3 characters long')
    .trim(),
  username: z
    .string('Username is requried')
    .min(3, 'Username must be at least 3 characters long')
    .regex(
      /^[a-z0-9_]+$/,
      'Only lowercase letters, numbers, and underscores allowed',
    )
    .trim(),
  bio: z
    .string()
    .max(160, 'Bio must be under 160 characters')
    .trim()
    .optional(),
})

type FormSchema = z.infer<typeof formSchema>

interface AccountProfileSectionProps {
  profile: Profile
}

export default function AccountProfileSection({
  profile,
}: AccountProfileSectionProps) {
  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', username: '', bio: '' },
  })

  const onSubmit = async (data: FormSchema) => {
    const result = await updateProfile(data)

    if (!result) {
      toast.error('Updating profile failed')
      return
    }

    if (!result.success) {
      toast.error('Updating failed')

      if (result.field) {
        setError(result.field as keyof FormSchema, {
          type: 'server',
          message: result.message,
        })
      } else {
        setError('root', {
          type: 'server',
          message: result.message,
        })
      }

      return
    }

    toast.success('Profile updated successfully')
    reset(result.updatedProfile)
  }

  useEffect(() => {
    if (!profile) return

    reset({
      name: profile.name ?? '',
      username: profile.username ?? '',
      bio: profile.bio ?? '',
    })
  }, [profile, reset])

  return (
    <View className='my-4 gap-4'>
      <Controller
        name='name'
        control={control}
        render={({ field }) => (
          <View className='gap-4'>
            <Label
              htmlFor='name'
              className={cn(errors.name && 'text-destructive')}
            >
              Name
            </Label>

            <Input
              {...field}
              id='name'
              placeholder='John Doe'
              autoComplete='name'
              autoCapitalize='words'
              returnKeyType='next'
              submitBehavior='submit'
              value={field.value}
              onChangeText={field.onChange}
              className={cn(
                errors.name && 'border-destructive text-destructive',
              )}
            />

            {errors.name && (
              <Text
                variant='small'
                className='leading-relaxed text-destructive'
              >
                {errors.name.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        name='username'
        control={control}
        render={({ field }) => (
          <View className='gap-4'>
            <Label
              htmlFor='username'
              className={cn(errors.username && 'text-destructive')}
            >
              Username
            </Label>

            <Input
              {...field}
              id='username'
              placeholder='john_doe'
              autoComplete='username'
              returnKeyType='next'
              submitBehavior='submit'
              value={field.value}
              onChangeText={field.onChange}
              className={cn(
                errors.username && 'border-destructive text-destructive',
              )}
            />

            {errors.username && (
              <Text
                variant='small'
                className='leading-relaxed text-destructive'
              >
                {errors.username.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        name='bio'
        control={control}
        render={({ field }) => (
          <View className='gap-4'>
            <Label
              htmlFor='bio'
              className={cn(errors.bio && 'text-destructive')}
            >
              Bio
            </Label>

            <Textarea
              {...field}
              id='bio'
              placeholder='Tell us something about yourself'
              autoCapitalize='sentences'
              returnKeyType='next'
              submitBehavior='submit'
              value={field.value}
              onChangeText={field.onChange}
              className={cn(
                errors.bio && 'border-destructive text-destructive',
                'placeholder:text-muted-foreground',
              )}
            />

            {errors.bio && (
              <Text
                variant='small'
                className='leading-relaxed text-destructive'
              >
                {errors.bio.message}
              </Text>
            )}
          </View>
        )}
      />

      {errors.root && (
        <Alert variant='destructive' icon={AlertCircleIcon}>
          <AlertTitle>An error occured.</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <Button
        className='w-fit max-w-fit cursor-pointer disabled:cursor-not-allowed'
        disabled={!isDirty || isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        {isSubmitting ? (
          <>
            <Spinner className='text-primary-foreground' />
            <Text>Saving</Text>
          </>
        ) : (
          <Text>Save</Text>
        )}
      </Button>
    </View>
  )
}
