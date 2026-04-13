import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@chatly/types/profile'
import { type User } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { createStore } from 'zustand/vanilla'

export interface ChatlyState {
  user: User | null
  profile: Profile | null
}

export interface ChatlyActions {
  logout: (scope: 'global' | 'local' | 'others') => void
  setProfile: (profile: Profile) => void
  setUser: (profile: User) => void
}

export type ChatlyStore = ChatlyState & ChatlyActions

const DEFAULT_STATE: ChatlyState = {
  user: null,
  profile: null,
}

const supabase = createClient()

export const createChatlyStore = () => {
  return createStore<ChatlyStore>()((set) => ({
    ...DEFAULT_STATE,

    logout: async (scope): Promise<void> => {
      const { error } = await supabase.auth.signOut({ scope })
      if (error) {
        console.error('Error signing out:', error)
        toast.error(
          'Logout failed. Please check your connection and try again.',
        )
        return
      }

      switch (scope) {
        case 'local':
          toast.success('Logged out')
          set(DEFAULT_STATE)
          break
        case 'global':
          toast.success('Logged out of all sessions')
          set(DEFAULT_STATE)
          break
        case 'others':
          toast.success('Logged out of all other sessions')
          break
        default:
          break
      }
    },

    setProfile: (profile) => set({ profile }),
    setUser: (user) => set({ user }),
  }))
}
