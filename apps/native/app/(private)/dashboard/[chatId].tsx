// apps/native/app/(private)/dashboard/[chatId].tsx
import ChatHeader from '@/components/chat-header'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useLayoutEffect } from 'react'

export default function Page() {
  const { chatId } = useLocalSearchParams<{ chatId?: string }>()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    if (!chatId) return

    navigation.setOptions({
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
