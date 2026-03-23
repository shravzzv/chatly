import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { mapResetPasswordErrors } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, router } from 'expo-router'
import { AlertCircle } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TextInput, View } from 'react-native'
import * as z from 'zod'
import PasswordInput from './password-input'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Spinner } from './ui/spinner'

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .trim(),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long')
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: `Doesn't match the new password`,
    path: ['confirmPassword'],
  })

type FormSchema = z.infer<typeof formSchema>

export function ResetPasswordForm() {
  const [authGlobalError, setAuthGlobalError] = useState<string | null>(null)
  const [isInvalidSession, setIsInvalidSession] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const confirmPasswordInputRef = useRef<TextInput>(null)

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setIsInvalidSession(true)
        setIsLoading(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) setIsInvalidSession(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onPasswordSubmitEditing = () => {
    confirmPasswordInputRef.current?.focus()
  }

  const onSubmit = async (data: FormSchema) => {
    if (!supabase || isSubmitting || isInvalidSession) return

    setAuthGlobalError(null)

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (error) {
      setAuthGlobalError(mapResetPasswordErrors(error))
      return
    }

    router.replace('/dashboard')
  }

  if (isLoading) {
    return (
      <Card className='w-full max-w-md items-center justify-center gap-3 border-border py-10 shadow-none sm:shadow-md sm:shadow-black/5'>
        <Spinner />
        <Text className='text-sm text-muted-foreground'>
          Verifying your reset link...
        </Text>
      </Card>
    )
  }

  if (isInvalidSession) {
    return (
      <Alert
        variant='destructive'
        icon={AlertCircle}
        className='w-full max-w-md gap-4'
      >
        <AlertTitle>Reset link expired</AlertTitle>
        <AlertDescription>
          This link isn&apos;t valid anymore. You can request a new one to
          continue.
        </AlertDescription>

        <Link href='/forgot-password' asChild>
          <Button size='sm'>
            <Text>Request a new link</Text>
          </Button>
        </Link>
      </Alert>
    )
  }

  return (
    <Card className='w-full max-w-md border-border shadow-none sm:shadow-md sm:shadow-black/5'>
      <CardHeader>
        <CardTitle className='text-center text-xl'>Reset password</CardTitle>
        <CardDescription className='text-center'>
          Enter and confirm your new password
        </CardDescription>
      </CardHeader>

      <CardContent className='gap-6'>
        <View className='gap-6'>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <View className='gap-4'>
                <View className='flex-row items-center justify-between'>
                  <Label
                    htmlFor='password'
                    className={errors.password ? 'text-destructive' : ''}
                  >
                    New password
                  </Label>
                </View>

                <PasswordInput
                  {...field}
                  value={field.value}
                  onChangeText={field.onChange}
                  onSubmitEditing={onPasswordSubmitEditing}
                  editable={!isSubmitting && !isInvalidSession}
                  className={cn(
                    errors.password && 'border-destructive text-destructive',
                  )}
                />

                {!errors.password && (
                  <Text className='text-sm text-muted-foreground'>
                    Use at least 8 characters ({field.value.length}
                    /8)
                  </Text>
                )}

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

          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <View className='gap-4'>
                <View className='flex-row items-center justify-between'>
                  <Label
                    htmlFor='confirmPassword'
                    className={cn(errors.confirmPassword && 'text-destructive')}
                  >
                    Confirm password
                  </Label>
                </View>

                <PasswordInput
                  {...field}
                  value={field.value}
                  inputRef={confirmPasswordInputRef}
                  onChangeText={field.onChange}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  editable={!isSubmitting && !isInvalidSession}
                  placeholder='confirm password'
                  className={cn(
                    errors.confirmPassword &&
                      'border-destructive text-destructive',
                  )}
                />

                {!errors.confirmPassword && (
                  <Text className='text-sm text-muted-foreground'>
                    Must match the new password
                  </Text>
                )}

                {errors.confirmPassword && (
                  <Text
                    variant='small'
                    className='leading-relaxed text-destructive'
                  >
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            )}
          />

          {authGlobalError && (
            <Alert variant='destructive' icon={AlertCircle}>
              <AlertTitle>Password reset failed</AlertTitle>
              <AlertDescription>{authGlobalError}</AlertDescription>
            </Alert>
          )}

          <Button
            className='w-full disabled:cursor-not-allowed'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || isInvalidSession}
          >
            {isSubmitting ? (
              <>
                <Spinner className='text-primary-foreground' />
                <Text>Resetting password...</Text>
              </>
            ) : (
              <Text>Reset password</Text>
            )}
          </Button>
        </View>
      </CardContent>
    </Card>
  )
}
