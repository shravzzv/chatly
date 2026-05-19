import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/providers/auth-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Linking from 'expo-linking'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import * as z from 'zod'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Spinner } from './ui/spinner'
import { Text } from './ui/text'

const formSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

type FormSchema = z.infer<typeof formSchema>

export default function AccountEmailInput() {
  const { user } = useAuthContext()
  const [showDialog, setShowDialog] = useState(false)

  const {
    handleSubmit,
    control,
    setError,
    reset,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: FormSchema) => {
    if (!supabase || isSubmitting || !isDirty) return

    const emailRedirectTo = Linking.createURL('/account')

    const { error } = await supabase.auth.updateUser(
      { email: data.email },
      { emailRedirectTo },
    )

    if (error) {
      console.error(error)
      setError('email', {
        type: 'server',
        message: error.message,
      })

      toast.error('Failed to update email')
      return
    }

    reset({ email: data.email })
    setShowDialog(true)
  }

  useEffect(() => {
    if (!user?.email) return

    reset({ email: user.email })
  }, [reset, user?.email])

  return (
    <View className='gap-4'>
      <Controller
        name='email'
        control={control}
        render={({ field }) => (
          <View className='gap-4'>
            <Label
              htmlFor='email'
              className={cn(errors.email && 'text-destructive')}
            >
              Email
            </Label>

            <Input
              {...field}
              id='email'
              placeholder='m@example.com'
              autoComplete='email'
              returnKeyType='done'
              submitBehavior='submit'
              value={field.value}
              onChangeText={field.onChange}
              editable={!isSubmitting}
              onSubmitEditing={handleSubmit(onSubmit)}
              className={cn(
                errors.email && 'border-destructive text-destructive',
              )}
            />

            {errors.email && (
              <Text
                variant='small'
                className='leading-relaxed text-destructive'
              >
                {errors.email.message}
              </Text>
            )}
          </View>
        )}
      />

      <Button
        className='w-fit max-w-fit cursor-pointer disabled:cursor-not-allowed'
        disabled={!isDirty || isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        {isSubmitting ? (
          <>
            <Spinner className='text-primary-foreground' />
            <Text>Updating email</Text>
          </>
        ) : (
          <Text>Update email</Text>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your email</DialogTitle>

            <DialogDescription>
              We&apos;ve sent a confirmation link to{' '}
              <Text className='font-bold'>{getValues('email')}</Text>. You can
              continue using your current email until it&apos;s confirmed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button className='cursor-pointer'>
                <Text>Close</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  )
}
