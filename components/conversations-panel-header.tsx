'use client'

import { Search, MessagesSquare, FilePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { SidebarTrigger } from '@/components/sidebar-trigger'
import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

interface ConversationsPanelHeaderProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  openProfileSelectDialog: () => void
}

export default function ConversationsPanelHeader({
  searchQuery,
  setSearchQuery,
  openProfileSelectDialog,
}: ConversationsPanelHeaderProps) {
  const isMobileView = useIsMobile()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  /**
   * Enable keyboard shortcut (Ctrl/Cmd + F) to focus the search input.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className='border-b px-4 space-y-4 py-4'>
      <div className='flex items-center justify-between'>
        <SidebarTrigger />

        <h2 className='text-xl font-semibold flex items-center gap-4'>
          Inbox
          <MessagesSquare />
        </h2>

        <Button
          variant='outline'
          size='icon-sm'
          className='cursor-pointer'
          onClick={openProfileSelectDialog}
        >
          <FilePen className='w-5 h-5' />
        </Button>
      </div>

      <InputGroup>
        <InputGroupInput
          type='search'
          placeholder='name or username...'
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <InputGroupAddon>
          <Search className='w-4 h-4' />
        </InputGroupAddon>
        {!isMobileView && (
          <InputGroupAddon align='inline-end'>
            <Kbd>⌘</Kbd>
            <Kbd>F</Kbd>
          </InputGroupAddon>
        )}
      </InputGroup>
    </header>
  )
}
