// apps/native/app/_layout.tsx
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import '@/global.css'
import { handleAuthRedirect } from '@/lib/auth'
import { NAV_THEME } from '@/lib/theme'
import { cn } from '@/lib/utils'
import AuthProvider, { useAuthContext } from '@/providers/auth-provider'
import ThemeProvider from '@/providers/theme-provider'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter'
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native'
import { PortalHost } from '@rn-primitives/portal'
import * as Linking from 'expo-linking'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'nativewind'
import { useEffect } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Toaster } from 'sonner-native'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync()
    }
  }, [loaded, error])

  const url = Linking.useLinkingURL()

  useEffect(() => {
    if (!url) return
    handleAuthRedirect(url)
  }, [url])

  if (!loaded && !error) return null

  return (
    <AuthProvider>
      <InnerRootLayout />
    </AuthProvider>
  )
}

function InnerRootLayout() {
  const { colorScheme } = useColorScheme()
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <NavThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <ThemeProvider>
          <View
            className={cn(
              colorScheme === 'dark' && 'dark',
              'bg-surface flex-1 items-center justify-center gap-2 font-sans text-base text-foreground',
            )}
          >
            <StatusBar translucent={false} />
            <Spinner />
            <Text className='text-muted-foreground'>Checking session...</Text>
          </View>
        </ThemeProvider>
      </NavThemeProvider>
    )
  }

  return (
    <NavThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <ThemeProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView className='flex-1'>
            <View
              className={cn(colorScheme === 'dark' && 'dark', 'flex-1')}
              /**
               * class 'dark' is required to keep the app's 'system' theme in
               * sync with OS in real time (edge case)
               */
            >
              <StatusBar translucent={false} />

              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={!isAuthenticated}>
                  <Stack.Screen name='(public)' />
                </Stack.Protected>

                <Stack.Protected guard={isAuthenticated}>
                  <Stack.Screen name='(private)' />
                </Stack.Protected>

                <Stack.Screen name='+not-found' />
              </Stack>

              <PortalHost />

              <Toaster
                richColors
                closeButton
                position='top-center'
                swipeToDismissDirection='left'
              />
            </View>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ThemeProvider>
    </NavThemeProvider>
  )
}
