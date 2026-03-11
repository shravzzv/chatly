import { Link } from 'expo-router'
import { Text, View } from 'react-native'

export default function Page() {
  return (
    <View className='max-w-sm items-center gap-4'>
      <Text
        className='text-center text-2xl font-medium'
        accessibilityRole='header'
      >
        Page not found
      </Text>

      <Text className='dark:text-muted-dark text-center text-sm text-muted'>
        The link might be broken or the page may have moved.
      </Text>

      <Link href='/' asChild>
        <Text className='dark:text-primary-dark text-primary underline underline-offset-2'>
          Back to home
        </Text>
      </Link>
    </View>
  )
}
