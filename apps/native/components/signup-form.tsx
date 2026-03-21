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
import { mapSignupAuthErrors } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import type { AuthState } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Linking from 'expo-linking'
import { Link } from 'expo-router'
import { AlertCircle, BadgeCheck } from 'lucide-react-native'
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

export function SignUpForm() {
  const passwordInputRef = useRef<TextInput>(null)
  const [showEmailAlert, setShowEmailAlert] = useState(false)
  const [authGlobalError, setAuthGlobalError] = useState<string | null>(null)
  const [authState, setAuthState] = useState<AuthState>({
    status: 'idle',
    provider: null,
  })

  const {
    handleSubmit,
    control,
    reset,
    setError,
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

    setShowEmailAlert(false)
    setAuthGlobalError(null)
    setAuthState({ status: 'loading', provider: 'email' })
    const emailRedirectTo = Linking.createURL('/')

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { emailRedirectTo },
      })

      if (error) {
        const mappedError = mapSignupAuthErrors(error)

        if (mappedError.field) {
          setError(mappedError.field, {
            type: 'server',
            message: mappedError.message,
          })
          return
        }

        setAuthGlobalError(mappedError.message)
        return
      }

      setShowEmailAlert(true)
      reset({ email: data.email, password: '' })
    } finally {
      setAuthState({ status: 'idle', provider: null })
    }
  }

  return (
    <Card className='w-full max-w-md border-border shadow-none sm:shadow-md sm:shadow-black/5'>
      <CardHeader>
        <CardTitle className='text-center text-xl'>
          Create your account
        </CardTitle>

        <CardDescription className='text-center'>
          Enter your email below to create your account
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

                {!errors.email && (
                  <Text className='text-sm text-muted-foreground'>
                    We&apos;ll use this to contact you. We will not share your
                    email with anyone else.
                  </Text>
                )}

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

          {showEmailAlert && (
            <Alert icon={BadgeCheck}>
              <AlertTitle>Verification email sent</AlertTitle>
              <AlertDescription>
                Please check your inbox to confirm your account.
              </AlertDescription>
            </Alert>
          )}

          {authGlobalError && (
            <Alert variant='destructive' icon={AlertCircle}>
              <AlertTitle>Sign up failed</AlertTitle>
              <AlertDescription>{authGlobalError}</AlertDescription>
            </Alert>
          )}

          <Button
            className='w-full'
            onPress={handleSubmit(onSubmit)}
            disabled={
              isSubmitting || showEmailAlert || authState.status === 'loading'
            }
          >
            {authState.status === 'loading' &&
            authState.provider === 'email' ? (
              <>
                <Spinner className='text-primary-foreground' />
                <Text>Creating account...</Text>
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
          <Text variant='muted'>Already have an account? </Text>

          <Link href='/(public)/signin'>
            <Text variant='muted' className='underline underline-offset-4'>
              Sign in
            </Text>
          </Link>
        </View>
      </CardContent>
    </Card>
  )
}
