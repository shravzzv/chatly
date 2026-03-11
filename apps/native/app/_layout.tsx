import '@/global.css'
import { NAV_THEME } from '@/lib/theme'
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
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'nativewind'
import { useEffect } from 'react'
import { View } from 'react-native'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const { colorScheme } = useColorScheme()

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

  if (!loaded && !error) {
    return null
  }

  return (
    <NavThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <ThemeProvider>
        <View
          style={{ flex: 1 }}
          className={colorScheme === 'dark' ? 'dark' : ''}
          /**
           * class 'dark' is required to keep the app's 'system' theme in
           * sync with OS in real time (edge case)
           */
        >
          <StatusBar />
          <Stack>
            <Stack.Screen
              name='(tabs)'
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name='+not-found'
              options={{
                headerShown: false,
              }}
            />
          </Stack>
          <PortalHost />
        </View>
      </ThemeProvider>
    </NavThemeProvider>
  )
}
