import { createStore } from 'zustand/vanilla'
import { type User } from '@supabase/supabase-js'
import { type Profile } from '@/types/profile'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

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

    logout: async (scope) => {
      const { error } = await supabase.auth.signOut({ scope })
      if (error) {
        console.error('Error signing out:', error)
        toast.error(
          'Logout failed. Please check your connection and try again.'
        )
      }

      set(DEFAULT_STATE)
      toast.success('Logout succeeded.')
    },

    setProfile: (profile) => set({ profile }),
    setUser: (user) => set({ user }),
  }))
}
