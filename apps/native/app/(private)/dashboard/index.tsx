// apps/native/app/(private)/dashboard/index.tsx
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'
import { Link, router } from 'expo-router'
import { toast } from 'sonner-native'

export default function Page() {
  const handleLogout = async () => {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Failed to sign out', error)
      return
    }

    router.replace('/signin')
    toast.success('Signed out')
  }

  return (
    <Screen>
      <Button onPress={handleLogout} className='mb-5 w-fit'>
        <Text>Log out</Text>
      </Button>

      <Link href='/dashboard/johndoe'>
        <Text className='underline'>John doe</Text>
      </Link>

      <Link href='/dashboard/janedoe'>
        <Text className='underline'>Jane doe</Text>
      </Link>
    </Screen>
  )
}
