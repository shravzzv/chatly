import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { mapForgotPasswordErrors } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Linking from 'expo-linking'
import { Link } from 'expo-router'
import { AlertCircle, BadgeCheck } from 'lucide-react-native'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import * as z from 'zod'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Spinner } from './ui/spinner'

const formSchema = z.object({
  email: z.email('A valid email is required').trim(),
})

type FormSchema = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const [showEmailAlert, setShowEmailAlert] = useState(false)
  const [authGlobalError, setAuthGlobalError] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: FormSchema) => {
    if (!supabase || isSubmitting) return

    setShowEmailAlert(false)
    setAuthGlobalError(null)
    const redirectTo = Linking.createURL('/reset-password')

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo,
    })

    if (error) {
      setAuthGlobalError(mapForgotPasswordErrors(error))
      return
    }

    setShowEmailAlert(true)
  }

  return (
    <Card className='w-full max-w-md border-border shadow-none sm:shadow-md sm:shadow-black/5'>
      <CardHeader>
        <CardTitle className='text-center text-xl'>Forgot password?</CardTitle>
        <CardDescription className='text-center'>
          Enter your email and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent className='gap-6'>
        <Controller
          name='email'
          control={control}
          render={({ field }) => (
            <View className='gap-4'>
              <Label
                htmlFor='email'
                className={errors.email ? 'text-destructive' : ''}
              >
                Email
              </Label>

              <Input
                {...field}
                id='email'
                placeholder='m@example.com'
                keyboardType='email-address'
                autoComplete='email'
                autoCapitalize='none'
                returnKeyType='send'
                submitBehavior='submit'
                value={field.value}
                onChangeText={field.onChange}
                editable={!showEmailAlert}
                onSubmitEditing={handleSubmit(onSubmit)}
                className={
                  errors.email ? 'border-destructive text-destructive' : ''
                }
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

        {showEmailAlert && (
          <Alert icon={BadgeCheck}>
            <AlertTitle>Check your email</AlertTitle>

            <AlertDescription>
              If an account exists for this email, you&apos;ll receive a reset
              link shortly. Be sure to look in your inbox and spam folder.
            </AlertDescription>
          </Alert>
        )}

        {authGlobalError && (
          <Alert variant='destructive' icon={AlertCircle}>
            <AlertTitle>Password reset failed</AlertTitle>
            <AlertDescription>{authGlobalError}</AlertDescription>
          </Alert>
        )}

        <Button
          className='w-full disabled:cursor-not-allowed'
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || showEmailAlert}
        >
          {isSubmitting ? (
            <>
              <Spinner className='text-primary-foreground' />
              <Text>Sending link...</Text>
            </>
          ) : (
            <Text>Send reset link</Text>
          )}
        </Button>
      </CardContent>

      <CardFooter className='flex-row justify-center'>
        <Text variant='muted' className='text-muted-foreground'>
          Remembered your password?{' '}
        </Text>

        <Link href='/signin'>
          <Text
            variant='muted'
            className='text-muted-foreground underline underline-offset-4'
          >
            Sign in
          </Text>
        </Link>
      </CardFooter>
    </Card>
  )
}
