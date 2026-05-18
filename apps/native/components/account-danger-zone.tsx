import { Link } from 'expo-router'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Text } from './ui/text'

export default function AccountDangerZone() {
  return (
    <View className='my-4 gap-4'>
      <Text className='font-semibold text-lg text-destructive'>
        Danger zone
      </Text>

      <Button variant='destructive' className='w-fit'>
        <Text>Delete account</Text>
      </Button>

      <Text className='text-xs text-muted-foreground'>
        You need to cancel your{' '}
        <Link href='/plan' className='underline'>
          plan
        </Link>{' '}
        if you want to delete your account.
      </Text>
    </View>
  )
}
