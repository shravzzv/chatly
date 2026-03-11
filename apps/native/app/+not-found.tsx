import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function Page() {
  return (
    <Screen className='items-center justify-center'>
      <View className='max-w-sm items-center gap-4'>
        <Text variant='h1'>Page not found</Text>

        <Text variant='muted'>
          The link might be broken or the page may have moved.
        </Text>

        <Link href='/' asChild>
          <Text className='underline underline-offset-2'>Back to home</Text>
        </Link>
      </View>
    </Screen>
  )
}
