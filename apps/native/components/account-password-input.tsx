import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useNetworkContext } from '@/providers/network-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import * as z from 'zod'
import PasswordInput from './password-input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Spinner } from './ui/spinner'
import { Text } from './ui/text'

const formSchema = z.object({
  password: z
    .string('Password is requried')
    .min(8, 'Password must be at least 8 characters long')
    .trim(),
})

type FormSchema = z.infer<typeof formSchema>

export default function AccountPasswordInput() {
  const { isOnline } = useNetworkContext()

  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  })

  const onSubmit = async (data: FormSchema) => {
    if (!supabase || isSubmitting || !isDirty) return

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      setError('password', {
        type: 'server',
        message: error.message,
      })

      toast.error('Failed to update password')
      return
    }

    reset()
    toast.success('Password updated successfully')
  }

  return (
    <View className='gap-4'>
      <Controller
        name='password'
        control={control}
        render={({ field }) => (
          <View className='gap-4'>
            <Label
              htmlFor='password'
              className={cn(errors.password && 'text-destructive')}
            >
              Password
            </Label>

            <PasswordInput
              {...field}
              id='password'
              placeholder='••••••••'
              value={field.value}
              onChangeText={field.onChange}
              editable={!isSubmitting && isOnline}
              onSubmitEditing={handleSubmit(onSubmit)}
              className={cn(
                errors.password && 'border-destructive text-destructive',
              )}
            />

            {errors.password && (
              <Text
                variant='small'
                className='leading-relaxed text-destructive'
              >
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      <Text className='text-xs text-muted-foreground'>
        Changing your password will sign you out of other sessions.
      </Text>

      <Button
        className='w-fit max-w-fit cursor-pointer disabled:cursor-not-allowed'
        disabled={!isDirty || isSubmitting || !isOnline}
        onPress={handleSubmit(onSubmit)}
      >
        {isSubmitting ? (
          <>
            <Spinner className='text-primary-foreground' />
            <Text>Updating password</Text>
          </>
        ) : (
          <Text>Update password</Text>
        )}
      </Button>
    </View>
  )
}
