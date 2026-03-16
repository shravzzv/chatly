// apps/native/app/index.tsx
import { useAuthContext } from '@/providers/auth-provider'
import { Redirect } from 'expo-router'

export default function Index() {
  const { isAuthenticated } = useAuthContext()

  if (isAuthenticated) {
    return <Redirect href='/dashboard' />
  }

  return <Redirect href='/signin' />
}
