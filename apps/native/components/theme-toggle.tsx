import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { useThemeContext } from '@/providers/theme-provider'
import type { ThemeMode } from '@/types/use-theme'
import {
  type LucideIcon,
  Monitor,
  Moon,
  Smartphone,
  Sun,
} from 'lucide-react-native'
import { Platform, View } from 'react-native'

const modes: { mode: ThemeMode; IconValue: LucideIcon }[] = [
  { mode: 'light', IconValue: Sun },
  { mode: 'dark', IconValue: Moon },
  { mode: 'system', IconValue: Platform.OS === 'web' ? Monitor : Smartphone },
]

export function ThemeToggle() {
  const { theme, updateTheme } = useThemeContext()

  return (
    <View className='mx-auto flex-row gap-1 rounded-md border border-border p-1'>
      {modes.map(({ mode, IconValue }) => {
        const isActive = theme === mode

        return (
          <Button
            key={mode}
            size='sm'
            className='border-border'
            onPress={() => updateTheme(mode)}
            variant={isActive ? 'default' : 'ghost'}
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
