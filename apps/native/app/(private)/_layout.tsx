import { PrivateProvider } from '@/providers/private-provider'
import { Stack } from 'expo-router'

export default function PrivateLayout() {
  return (
    <PrivateProvider>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='chat/[chatId]'
          options={{ headerTitleAlign: 'center', title: '' }}
        />
      </Stack>
    </PrivateProvider>
  )
}
