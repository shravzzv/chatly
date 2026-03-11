import '@/global.css'
import { NAV_THEME } from '@/lib/theme'
import ThemeProvider from '@/providers/theme-provider'
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native'
import { PortalHost } from '@rn-primitives/portal'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'nativewind'
import { View } from 'react-native'

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const { colorScheme } = useColorScheme()

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
