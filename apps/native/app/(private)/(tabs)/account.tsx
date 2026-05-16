import PasswordInput from '@/components/password-input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Screen } from '@/components/ui/screen'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Image, ScrollView, View } from 'react-native'
import { toast } from 'sonner-native'

export default function Account() {
  const [isSwitchChecked, setIsSwitchChecked] = useState<boolean>(false)

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
    <Screen className='px-0 py-0 md:py-0'>
      <ScrollView>
        <View className='mx-auto w-full max-w-md gap-4 rounded-lg px-8 py-2'>
          <View className='my-4 flex-row items-center gap-4'>
            <Image
              source={{
                uri: 'https://npbjaqzidsmgbovyawtw.supabase.co/storage/v1/object/public/avatars/a425ef5a-6edb-410c-9ff1-5e6737790ea3/avatar?v=6c595cf7-361b-4856-ad2f-d381f19d3dd7',
              }}
              alt='avatar'
              className='size-24 rounded-full'
            />

            <View>
              <Text className='font-bold'>Profile Picture</Text>
              <Text className='text-xs text-muted-foreground'>
                JPG, PNG or GIF. Max 5MB.
              </Text>
            </View>
          </View>

          <Separator />

          <View className='my-4 gap-4'>
            <Label>Name</Label>
            <Input value='Test User' />

            <Label>Username</Label>
            <Input value='test_user' />

            <Label>Bio</Label>
            <Textarea value={`Hi, I'm a test user.`} />

            <Button className='w-fit disabled:cursor-not-allowed' disabled>
              <Text>Save</Text>
            </Button>
          </View>

          <Separator />

          <View className='my-4 gap-4'>
            <Text className='font-semibold text-lg'>Preferences</Text>

            <View className='flex-row items-center justify-between'>
              <Text>Theme</Text>
              <ThemeToggle />
            </View>

            <View className='flex-row items-center justify-between'>
              <Text>Notifications</Text>
              <Switch
                checked={isSwitchChecked}
                onCheckedChange={() => setIsSwitchChecked((p) => !p)}
              />
            </View>
          </View>

          <Separator />

          <View className='my-4 gap-4'>
            <Text className='font-semibold text-lg'>Security</Text>

            <Text className='font-medium text-sm text-emerald-600'>
              Your email test@test.com is verified and active.
            </Text>

            <Label>Email</Label>
            <Input value='test@test.com' />
            <Button className='w-fit' disabled>
              <Text>Update email</Text>
            </Button>

            <Label>Password</Label>
            <PasswordInput
              value=''
              onChangeText={() => {}}
              placeholder='••••••••'
            />
            <Text className='text-xs text-muted-foreground'>
              Changing your password will sign you out of other sessions.
            </Text>
            <Button className='w-fit' disabled>
              <Text>Update password</Text>
            </Button>

            <View className='flex-row gap-2'>
              <Button onPress={handleLogout} className='w-fit'>
                <Text>Log out</Text>
              </Button>

              <Button className='w-fit' variant='outline'>
                <Text>Log out of all sessions</Text>
              </Button>
            </View>
          </View>

          <Separator />

          <View className='my-4 gap-4'>
            <Text className='font-semibold text-lg text-destructive'>
              Danger zone
            </Text>

            <Button variant='destructive' className='w-fit'>
              <Text>Delete account</Text>
            </Button>

            <Text className='text-xs text-muted-foreground'>
              You need to cancel your{' '}
              <Link href='/plan' className='underline'>
                plan
              </Link>{' '}
              if you want to delete your account.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}
