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
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'expo-router'
import { useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { type TextInput, View } from 'react-native'
import * as z from 'zod'
import PasswordInput from './password-input'

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

  const onSubmit = (data: FormSchema) => {
    console.log('form submitted')
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

          <Button
            className='w-full'
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text>{isSubmitting ? 'Creating account...' : 'Continue'}</Text>
          </Button>
        </View>

        <View className='flex-row justify-center'>
          <Text variant='muted'>Already have an account? </Text>

          <Link href='/(public)/signin'>
            <Text variant='muted' className='underline underline-offset-4'>
              Sign in
            </Text>
          </Link>
        </View>

        <View className='flex-row items-center'>
          <Separator className='flex-1' />
          <Text className='px-4 text-sm text-muted-foreground'>or</Text>
          <Separator className='flex-1' />
        </View>

        <SocialConnections />
      </CardContent>
    </Card>
  )
}
