'use client'

import {
  type ReactNode,
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react'
import { useStore } from 'zustand'
import {
  ChatlyState,
  type ChatlyStore,
  createChatlyStore,
} from '@/stores/chatly-store'
import { createClient } from '@/utils/supabase/client'
import { usePathname, useRouter } from 'next/navigation'

export type ChatlyStoreApi = ReturnType<typeof createChatlyStore>

export interface ChatlyStoreProviderProps {
  children: ReactNode
  hydrationData: Partial<ChatlyState>
}

// create the context
export const ChatlyStoreContext = createContext<ChatlyStoreApi | undefined>(
  undefined
)

export const ChatlyStoreProvider = ({
  children,
  hydrationData,
}: ChatlyStoreProviderProps) => {
  const [store] = useState(() => createChatlyStore())

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    store.setState(hydrationData)
  }, [store, hydrationData])

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        store.setState({ user: null, profile: null })
        router.replace('/signin')
      }

      if (event === 'SIGNED_IN' && ['/signin', '/signup'].includes(pathname)) {
        router.replace('/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [store, router, pathname])

  return <ChatlyStoreContext value={store}>{children}</ChatlyStoreContext>
}

// a custom hook for using the store
export const useChatlyStore = <T,>(selector: (store: ChatlyStore) => T): T => {
  const chatlyStore = useContext(ChatlyStoreContext)

  if (!chatlyStore) {
    throw new Error(`useChatlyStore must be used within ChatlyStoreProvider`)
  }

  return useStore(chatlyStore, selector)
}
