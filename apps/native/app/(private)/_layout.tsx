// app/(private)/_layout.tsx
import { Stack } from 'expo-router'

export default function PrivateLayout() {
  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen
        name='chat/[chatId]'
        options={{ headerTitleAlign: 'center', title: '' }}
      />
    </Stack>
  )
}
