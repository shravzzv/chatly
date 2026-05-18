import { useState } from 'react'
import { View } from 'react-native'
import { ThemeToggle } from './theme-toggle'
import { Switch } from './ui/switch'
import { Text } from './ui/text'

export default function AccountPreferences() {
  const [isSwitchChecked, setIsSwitchChecked] = useState(false)

  return (
    <View className='my-4 gap-4'>
      <Text className='font-semibold text-lg'>Preferences</Text>

      <View className='flex-row items-center justify-between'>
        <Text>Theme</Text>
        <ThemeToggle />
      </View>

      <View className='flex-row items-center justify-between'>
        <Text>Notifications</Text>
        <Switch
          checked={isSwitchChecked}
          onCheckedChange={() => setIsSwitchChecked((prev) => !prev)}
        />
      </View>
    </View>
  )
}
