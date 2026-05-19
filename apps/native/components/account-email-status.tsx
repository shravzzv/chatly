import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/providers/auth-provider'
import * as Linking from 'expo-linking'
import { AlertCircle, BadgeCheck } from 'lucide-react-native'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Text } from './ui/text'

export default function AccountEmailStatus() {
  const { user } = useAuthContext()
  const newEmail = user?.new_email

  const handleSendConfirmation = async () => {
    if (!supabase || !newEmail) return
    const emailRedirectTo = Linking.createURL('/account')

    const { error } = await supabase.auth.resend({
      type: 'email_change',
      email: newEmail,
      options: { emailRedirectTo },
    })

    if (error) {
      console.error(error)
      toast.error('Failed to send email confirmation')
      return
    }

    toast.success('Email confirmation sent. Check your inbox.')
  }

  if (!user) return null

  if (!newEmail) {
    return (
      <Alert
        icon={BadgeCheck}
        iconClassName='text-emerald-600 dark:text-emerald-200 size-5 z-[999]'
        className='border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
      >
        <AlertTitle className='text-sm'>Email verified</AlertTitle>
        <AlertDescription>
          <Text>
            Your email <Text className='font-bold text-sm'>{user.email}</Text>{' '}
            has been confirmed and is active.
          </Text>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert
      icon={AlertCircle}
      iconClassName='text-amber-900 dark:text-amber-50 size-5 z-[999]'
      className='border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50'
    >
      <AlertTitle>Confirm your new email</AlertTitle>
      <AlertDescription>
        <View className='flex-col gap-2'>
          <Text>
            We&apos;ve sent a confirmation link to{' '}
            <Text className='font-bold'>{user.new_email}</Text>.
          </Text>

          <Text>
            Until it&apos;s confirmed, your current email{' '}
            <Text className='font-bold'>{user.email}</Text> will continue to be
            used.
          </Text>

          <Button
            variant='outline'
            size='sm'
            className='mt-2 block w-fit cursor-pointer'
            onPress={handleSendConfirmation}
          >
            <Text>Resend confirmation email</Text>
          </Button>
        </View>
      </AlertDescription>
    </Alert>
  )
}
