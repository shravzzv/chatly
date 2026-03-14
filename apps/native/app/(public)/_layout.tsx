// apps/native/app/(public)/_layout.tsx
import { Stack } from 'expo-router'

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='signin' />
      <Stack.Screen name='signup' />
    </Stack>
  )
}
