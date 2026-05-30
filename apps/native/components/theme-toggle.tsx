import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useNetworkContext } from '@/providers/network-provider'
import { useThemeContext } from '@/providers/theme-provider'
import type { ThemeMode } from '@/types/use-theme'
import { Profile } from '@chatly/types/profile'
import * as Haptics from 'expo-haptics'
import {
  type LucideIcon,
  Monitor,
  Moon,
  Smartphone,
  Sun,
} from 'lucide-react-native'
import { Platform, View } from 'react-native'
import { toast } from 'sonner-native'

async function updateProfile(updates: Partial<Profile>) {
  if (!supabase) return

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error
  } catch (error) {
    console.error('update profile error:', error)
    throw error
  }
}

const modes: { mode: ThemeMode; IconValue: LucideIcon }[] = [
  { mode: 'light', IconValue: Sun },
  { mode: 'dark', IconValue: Moon },
  { mode: 'system', IconValue: Platform.OS === 'web' ? Monitor : Smartphone },
]

export function ThemeToggle() {
  const { theme, updateTheme } = useThemeContext()
  const { isOnline } = useNetworkContext()

  const handleThemeChange = async (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const prevTheme = theme
    if (mode === prevTheme) return
    await updateTheme(mode)

    try {
      await updateProfile({ theme: mode })
      toast.info('Theme synced')
    } catch (error) {
      console.error('Error updating profile in ThemeToggle', error)
      toast.error('Failed to sync theme')
      updateTheme(prevTheme)
    }
  }

  return (
    <View className='flex-row gap-1 rounded-md border border-border p-1'>
      {modes.map(({ mode, IconValue }) => {
        const isActive = theme === mode

        return (
          <Button
            key={mode}
            size='sm'
            className='border-border'
            onPress={() => handleThemeChange(mode)}
            variant={isActive ? 'default' : 'ghost'}
            disabled={!isOnline}
          >
            <Icon
              as={IconValue}
              className={cn(isActive && 'text-primary-foreground')}
            />
          </Button>
        )
      })}
    </View>
  )
}
