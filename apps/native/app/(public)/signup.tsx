// apps/native/app/(public)/signup.tsx
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function Page() {
  return (
    <Screen className='items-center justify-center'>
      <Text>Signup to Chatly</Text>

      <View className='flex-row'>
        <Text variant='muted'>Already have an account? </Text>

        <Link href='/(public)/signin'>
          <Text variant='muted' className='underline'>
            Signin
          </Text>
        </Link>
      </View>
    </Screen>
  )
}
