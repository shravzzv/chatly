// apps/native/app/(public)/signin.tsx
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function Page() {
  return (
    <Screen className='items-center justify-center'>
      <Text>Signin to Chatly</Text>

      <View className='flex-row'>
        <Text variant='muted'>Don&apos;t have an account? </Text>

        <Link href='/(public)/signup'>
          <Text variant='muted' className='underline'>
            Signup
          </Text>
        </Link>
      </View>
    </Screen>
  )
}
