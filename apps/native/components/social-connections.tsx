import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import * as Linking from 'expo-linking'
import { useColorScheme } from 'nativewind'
import { Image, Platform, View } from 'react-native'

type Provider = 'google' | 'github' | 'apple'

const SOCIAL_CONNECTION_STRATEGIES = [
  {
    provider: 'google',
    source: { uri: 'https://img.clerk.com/static/google.png?width=160' },
    useTint: false,
  },
  {
    provider: 'github',
    source: { uri: 'https://img.clerk.com/static/github.png?width=160' },
    useTint: true,
  },
  {
    provider: 'apple',
    source: { uri: 'https://img.clerk.com/static/apple.png?width=160' },
    useTint: true,
  },
] as const

export function SocialConnections() {
  const { colorScheme } = useColorScheme()

  const handlePress = async (provider: Provider) => {
    if (!supabase) return
    const redirectTo = Linking.createURL('/')

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
  }

  return (
    <View className='flex-row gap-2'>
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.provider}
            variant='outline'
            size='sm'
            className='flex-1 disabled:cursor-not-allowed'
            disabled={strategy.provider === 'apple'}
            onPress={() => handlePress(strategy.provider)}
          >
            <Image
              className={cn(
                'size-4',
                strategy.useTint && Platform.select({ web: 'dark:invert' }),
              )}
              tintColor={Platform.select({
                native: strategy.useTint
                  ? colorScheme === 'dark'
                    ? 'white'
                    : 'black'
                  : undefined,
              })}
              source={strategy.source}
            />
          </Button>
        )
      })}
    </View>
  )
}
