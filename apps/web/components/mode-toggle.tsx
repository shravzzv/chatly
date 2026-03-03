'use client'

import { Moon, Sun, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useChatlyStore } from '@/providers/chatly-store-provider'
import { updateProfile } from '@/app/actions'
import { type Theme } from '@/types/profile'
import { toast } from 'sonner'

export function ModeToggle() {
  const setProfile = useChatlyStore((state) => state.setProfile)
  const profile = useChatlyStore((state) => state.profile)
  const { theme, setTheme } = useTheme()

  const handleThemeChange = async (value: Theme) => {
    const prevTheme = theme
    if (value === prevTheme) return
    setTheme(value)

    if (profile) {
      const { updatedProfile } = await updateProfile({ theme: value })

      if (updatedProfile) {
        setProfile(updatedProfile)
        toast.info('Theme synced successfully')
      } else {
        setTheme(prevTheme as string)
        toast.error('Theme sync failed')
      }
    }
  }

  const themes: { name: string; value: Theme }[] = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'System', value: 'system' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='cursor-pointer'>
        <Button variant='outline' size='icon' className='relative'>
          <Sun
            className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90'
            data-testid='light'
          />
          <Moon
            className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0'
            data-testid='dark'
          />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        {themes.map(({ name, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleThemeChange(value)}
            className='flex justify-between cursor-pointer'
          >
            <span>{name}</span>
            {theme === value && <Check className='h-4 w-4' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
