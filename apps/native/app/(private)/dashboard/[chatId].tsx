// apps/native/app/(private)/dashboard/[chatId].tsx
import ChatHeader from '@/components/chat-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useLayoutEffect } from 'react'
import { Platform } from 'react-native'

export default function Page() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    if (!chatId) return

    navigation.setOptions({
      headerLeft: () => (
        <Button
          variant='ghost'
          size='icon'
          onPress={() => router.replace('/dashboard')}
          className={cn(Platform.OS === 'web' && 'ml-6')}
        >
          <Icon as={ArrowLeft} className='size-6' />
        </Button>
      ),

      headerTitle: () => <ChatHeader chatId={chatId} />,
    })
  }, [chatId, navigation])

  return (
    <Screen>
      <Text>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minus id culpa
        saepe sint ut quaerat non exercitationem, nesciunt excepturi eligendi
        error molestiae ullam. Molestias, magnam quia? Recusandae exercitationem
        vero totam!
      </Text>
    </Screen>
  )
}
