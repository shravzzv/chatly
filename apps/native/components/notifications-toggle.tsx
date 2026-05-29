import { supabase } from '@/lib/supabase'
import { useNetworkContext } from '@/providers/network-provider'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import { toast } from 'sonner-native'
import { Spinner } from './ui/spinner'
import { Switch } from './ui/switch'
import { Text } from './ui/text'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const handleRegistrationError = (message: string) => {
  toast.error(message)
  throw Error(message)
}

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()

  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()

    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Push notification permission denied.')
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  if (!projectId) {
    handleRegistrationError('Expo project id missing.')
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    return token.data
  } catch (error) {
    handleRegistrationError(`${error}`)
  }
}

const subscribeToNativePush = async (token: string) => {
  if (!supabase) throw Error('Supabase unavailable')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw Error('Not authenticated')

  const { error } = await supabase.from('expo_push_tokens').upsert({
    user_id: user.id,
    token,
  })

  if (error) throw error
}

const unsubscribeFromNativePush = async (token: string) => {
  if (!supabase) throw Error('Supabase unavailable')

  const { error } = await supabase
    .from('expo_push_tokens')
    .delete()
    .eq('token', token)

  if (error) throw error
}

export default function NotificationsToggle() {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isOnline } = useNetworkContext()

  const handleToggleChange = async (nextEnabled: boolean) => {
    try {
      setIsLoading(true)

      if (nextEnabled) {
        const token = await registerForPushNotificationsAsync()
        if (!token) return

        await subscribeToNativePush(token)

        setExpoPushToken(token)
        setEnabled(true)

        toast.success('Push notifications enabled')

        return
      }

      if (expoPushToken) {
        await unsubscribeFromNativePush(expoPushToken)
      }

      setExpoPushToken('')
      setEnabled(false)

      toast.success('Push notifications disabled')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update notification settings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const hydratePushState = async () => {
      if (!supabase) return

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('expo_push_tokens')
        .select('token')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error(error)
        return
      }

      if (!data?.token) return

      setExpoPushToken(data.token)
      setEnabled(true)
    }

    const handleNotificationTap = (
      response: Notifications.NotificationResponse,
    ) => {
      const senderId = response.notification.request.content.data?.senderId

      if (!senderId) return
      router.push(`/chat/${String(senderId)}`)
    }

    const hydrateInitialNotification = () => {
      const response = Notifications.getLastNotificationResponse()
      if (!response) return

      requestAnimationFrame(() => {
        handleNotificationTap(response)
      })
    }

    hydratePushState()
    hydrateInitialNotification()

    const notificationListener = Notifications.addNotificationReceivedListener(
      () => {},
    )

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationTap,
      )

    return () => {
      notificationListener.remove()
      responseListener.remove()
    }
  }, [])

  return (
    <View className='flex-row items-center justify-between'>
      <Text>Push notifications</Text>

      {isLoading ? (
        <Spinner />
      ) : (
        <Switch
          checked={enabled}
          onCheckedChange={handleToggleChange}
          disabled={!isOnline}
        />
      )}
    </View>
  )
}
