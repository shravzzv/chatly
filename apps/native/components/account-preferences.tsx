import { Platform, View } from 'react-native'
import NotificationsToggle from './notifications-toggle'
import { ThemeToggle } from './theme-toggle'
import { Text } from './ui/text'

export default function AccountPreferences() {
  return (
    <View className='my-4 gap-4'>
      <Text className='font-semibold text-lg'>Preferences</Text>

      <View className='flex-row items-center justify-between'>
        <Text>Theme</Text>
        <ThemeToggle />
      </View>

      {Platform.OS !== 'web' && <NotificationsToggle />}
    </View>
  )
}
