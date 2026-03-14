// apps/native/app/index.tsx
import { isAuthenticated } from '@/lib/auth'
import { Redirect } from 'expo-router'

export default function Index() {
  if (isAuthenticated) {
    return <Redirect href='/(private)/dashboard' />
  }

  return <Redirect href='/(public)/signin' />
}
