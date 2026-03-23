// apps/native/app/(private)/dashboard/_layout.tsx
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function DashboardLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name='index' options={{ title: 'Inbox' }} />
        <Stack.Screen name='[chatId]' />
      </Stack>
    </SafeAreaProvider>
  )
}
