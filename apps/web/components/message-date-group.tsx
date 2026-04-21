'use client'

import { formatDateHeader } from '@/lib/date'
import type { Message as MessageType } from '@chatly/types/message'
import { useRef } from 'react'
import { Message } from './message'
import { Badge } from './ui/badge'

interface MessageDateGroupProps {
  date: string
  messages: MessageType[]
}

export default function MessageDateGroup({
  date,
  messages,
}: MessageDateGroupProps) {
  const badgeTopRef = useRef<HTMLDivElement | null>(null)

  const handleBadgeClick = () => {
    badgeTopRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className='relative'>
      <div ref={badgeTopRef}></div>
      <div className='sticky top-2 z-10 flex justify-center py-2'>
        <Badge
          variant='secondary'
          className='cursor-pointer'
          onClick={handleBadgeClick}
        >
          {formatDateHeader(new Date(date))}
        </Badge>
      </div>

      <div className='space-y-4'>
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  )
}
