import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import PasswordInput from './password-input'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Text } from './ui/text'

export default function AccountSecuritySection() {
  const handleLogout = async () => {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Failed to sign out', error)
      return
    }

    router.replace('/signin')
    toast.success('Signed out')
  }

  return (
    <View className='my-4 gap-4'>
      <Text className='font-semibold text-lg'>Security</Text>

      <Text className='text-sm text-emerald-600'>
        Your email{' '}
        <Text className='font-bold text-sm text-emerald-600'>
          test@test.com
        </Text>{' '}
        is verified and active.
      </Text>

      <Label>Email</Label>
      <Input value='test@test.com' />
      <Button className='w-fit' disabled>
        <Text>Update email</Text>
      </Button>

      <Label>Password</Label>
      <PasswordInput value='' onChangeText={() => {}} placeholder='••••••••' />
      <Text className='text-xs text-muted-foreground'>
        Changing your password will sign you out of other sessions.
      </Text>
      <Button className='w-fit' disabled>
        <Text>Update password</Text>
      </Button>

      <View className='flex-row gap-2'>
        <Button onPress={handleLogout} className='w-fit'>
          <Text>Log out</Text>
        </Button>

        <Button className='w-fit' variant='outline'>
          <Text>Log out of all sessions</Text>
        </Button>
      </View>
    </View>
  )
}
