// apps/native/app/(private)/dashboard/_layout.tsx
import { Stack } from 'expo-router'

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{ title: 'Inbox', headerLeft: () => null }}
      />
      <Stack.Screen name='[chatId]' options={{ title: '' }} />
    </Stack>
  )
}
