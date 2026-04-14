import ConversationPreview from '@/components/conversation-preview'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Screen } from '@/components/ui/screen'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useProfiles } from '@/hooks/use-profiles'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { Info } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, View } from 'react-native'

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('')

  const {
    filteredProfiles,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles(searchQuery)

  if (profilesLoading) {
    return (
      <Screen className='flex-row items-center justify-center gap-2'>
        <Spinner />
        <Text className='text-muted-foreground'>Loading conversations...</Text>
      </Screen>
    )
  }

  if (profilesError) {
    return (
      <Screen className='items-center justify-center'>
        <Alert icon={Info} variant='destructive' className='mx-auto max-w-lg'>
          <AlertTitle className='font-bold'>
            Fetching conversations failed.
          </AlertTitle>
          <AlertDescription>
            Your connection might be down or there is an error from our side.
            Try again after some time. Contact support if error persists.{' '}
          </AlertDescription>
        </Alert>
      </Screen>
    )
  }

  return (
    <Screen className='gap-2'>
      <Input
        className='mx-auto max-w-xl'
        placeholder='name or username...'
        returnKeyType='search'
        onChangeText={(v) => setSearchQuery(v)}
      />

      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        className='mx-auto w-full max-w-sm flex-1'
        contentContainerClassName={cn(
          filteredProfiles.length === 0 && 'flex-1',
          'w-full mx-auto max-w-sm gap-2 rounded-xl',
        )}
        ListEmptyComponent={() => (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-sm text-muted-foreground'>
              No profiles found
            </Text>
          </View>
        )}
        renderItem={({ item: profile }) => (
          <ConversationPreview
            profile={profile}
            onPress={() => router.push(`/chat/${profile.user_id}`)}
          />
        )}
      />
    </Screen>
  )
}
