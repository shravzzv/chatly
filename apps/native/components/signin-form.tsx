import { SocialConnections } from '@/components/social-connections'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'
import type { AuthState } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, router } from 'expo-router'
import { AlertCircle } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { type TextInput, View } from 'react-native'
import * as z from 'zod'
import PasswordInput from './password-input'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Spinner } from './ui/spinner'

const formSchema = z.object({
  email: z.email('A valid email is required').trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
})

type FormSchema = z.infer<typeof formSchema>

export function SignInForm() {
  const passwordInputRef = useRef<TextInput>(null)
  const [isAuthError, setIsAuthError] = useState<boolean>(false)
  const [authState, setAuthState] = useState<AuthState>({
    status: 'idle',
    provider: null,
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus()
  }

  const onSubmit = async (data: FormSchema) => {
    if (!supabase) return
    setAuthState({ status: 'loading', provider: 'email' })
    setIsAuthError(false)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setIsAuthError(true)
        return
      }

      router.replace('/dashboard')
    } finally {
      setAuthState({ status: 'idle', provider: null })
    }
  }

  return (
    <Card className='w-full max-w-md border-border shadow-none sm:shadow-md sm:shadow-black/5'>
      <CardHeader>
        <CardTitle className='text-center text-xl'>Welcome back</CardTitle>

        <CardDescription className='text-center'>
          Sign in to your Chatly account
        </CardDescription>
      </CardHeader>

      <CardContent className='gap-4'>
        <View className='gap-6'>
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
                  returnKeyType='next'
                  submitBehavior='submit'
                  value={field.value}
                  onChangeText={field.onChange}
                  onSubmitEditing={onEmailSubmitEditing}
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
                    Password
                  </Label>

                  <Link href='/(public)/signup'>
                    <Text
                      variant='muted'
                      className='underline underline-offset-4'
                    >
                      Forgot your password?
                    </Text>
                  </Link>
                </View>

                <PasswordInput
                  {...field}
                  value={field.value}
                  inputRef={passwordInputRef}
                  onChangeText={field.onChange}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  className={
                    errors.password ? 'border-destructive text-destructive' : ''
                  }
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

          {isAuthError && (
            <Alert variant='destructive' icon={AlertCircle}>
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>
                Check your email and password and try again.
              </AlertDescription>
            </Alert>
          )}

          <Button
            className='w-full'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || authState.status === 'loading'}
          >
            {authState.status === 'loading' &&
            authState.provider === 'email' ? (
              <>
                <Spinner className='text-primary-foreground' />
                <Text>Signing in...</Text>
              </>
            ) : (
              <Text>Continue</Text>
            )}
          </Button>
        </View>

        <View className='flex-row items-center'>
          <Separator className='flex-1' />
          <Text className='px-4 text-sm text-muted-foreground'>or</Text>
          <Separator className='flex-1' />
        </View>

        <SocialConnections authState={authState} setAuthState={setAuthState} />

        <View className='flex-row justify-center'>
          <Text variant='muted'>Don&apos;t have an account? </Text>

          <Link href='/signup'>
            <Text variant='muted' className='underline underline-offset-4'>
              Sign up
            </Text>
          </Link>
        </View>
      </CardContent>
    </Card>
  )
}
