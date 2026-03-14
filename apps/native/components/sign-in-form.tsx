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
import { Link } from 'expo-router'
import { useRef, useState } from 'react'
import { type TextInput, View } from 'react-native'
import PasswordInput from './password-input'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const passwordInputRef = useRef<TextInput>(null)

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus()
  }

  const onSubmit = () => {
    console.log(email)
    console.log(password)
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
          <View className='gap-4'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              placeholder='m@example.com'
              keyboardType='email-address'
              autoComplete='email'
              autoCapitalize='none'
              onSubmitEditing={onEmailSubmitEditing}
              value={email}
              onChangeText={setEmail}
              returnKeyType='next'
              submitBehavior='submit'
            />
          </View>
          <View className='gap-4'>
            <View className='flex-row items-center justify-between'>
              <Label htmlFor='password'>Password</Label>

              <Link href='/(public)/signup'>
                <Text variant='muted' className='underline underline-offset-4'>
                  Forgot your password?
                </Text>
              </Link>
            </View>

            <PasswordInput
              value={password}
              ref={passwordInputRef}
              onChangeText={setPassword}
              onSubmitEditing={onSubmit}
            />
          </View>

          <Button className='w-full' onPress={onSubmit}>
            <Text>Continue</Text>
          </Button>
        </View>

        <View className='flex-row justify-center'>
          <Text variant='muted'>Don&apos;t have an account? </Text>

          <Link href='/(public)/signup'>
            <Text variant='muted' className='underline underline-offset-4'>
              Sign up
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
