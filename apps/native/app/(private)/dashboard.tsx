// apps/native/app/(private)/dashboard.tsx
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
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
      <Text>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam
        laboriosam doloremque veniam iure! Atque eligendi iste odio sunt eos
        ducimus iusto ut! Autem ducimus quos fugiat debitis quasi aliquid
        dolore! Hello
      </Text>

      <Button onPress={handleLogout} className='w-fit'>
        <Text>Log out</Text>
      </Button>
    </Screen>
  )
}
