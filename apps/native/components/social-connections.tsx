// apps/native/components/social-connections.tsx
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { AuthState } from '@/types/auth'
import * as WebBrowser from 'expo-web-browser'
import { useColorScheme } from 'nativewind'
import { Image, Platform, View } from 'react-native'
import { Spinner } from './ui/spinner'

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

WebBrowser.maybeCompleteAuthSession()

const handlePress = async (provider: Provider) => {
  if (!supabase) return

  if (Platform.OS === 'web') {
    const redirectToWeb = window.location.origin + '/'

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectToWeb },
    })

    if (error) console.error('OAuth web error', error)
    return
  }

  const redirectToNative = 'chatly://'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectToNative,
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    console.error('SocialConnections auth error', error)
    return
  }

  await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectToNative)
}

interface SocialConnectionsProps {
  authState: AuthState
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
}

export function SocialConnections({
  authState,
  setAuthState,
}: SocialConnectionsProps) {
  const { colorScheme } = useColorScheme()

  return (
    <View className='flex-row gap-2'>
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.provider}
            variant='outline'
            size='sm'
            className='flex-1 disabled:cursor-not-allowed'
            disabled={
              // apple auth disabled provisionally
              strategy.provider === 'apple' || authState.status === 'loading'
            }
            onPress={async () => {
              if (authState.status === 'loading') return
              setAuthState({ status: 'loading', provider: strategy.provider })

              try {
                await handlePress(strategy.provider)
              } finally {
                setAuthState({ status: 'idle', provider: null })
              }
            }}
          >
            {authState.provider === strategy.provider ? (
              <Spinner />
            ) : (
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
            )}
          </Button>
        )
      })}
    </View>
  )
}
