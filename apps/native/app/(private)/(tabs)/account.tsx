import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { toast } from 'sonner-native'

export default function Account() {
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
    <Screen className='items-center gap-4'>
      <ThemeToggle />

      <Button onPress={handleLogout} className='w-fit'>
        <Text>Log out</Text>
      </Button>
    </Screen>
  )
}
