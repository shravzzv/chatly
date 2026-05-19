import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import AccountEmailInput from './account-email-input'
import AccountEmailStatus from './account-email-status'
import PasswordInput from './password-input'
import { Button } from './ui/button'
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

      <AccountEmailStatus />
      <AccountEmailInput />

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
