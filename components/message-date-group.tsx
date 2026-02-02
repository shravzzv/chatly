'use client'

import { formatDateHeader } from '@/lib/date'
import { Badge } from './ui/badge'
import { Message } from './message'
import { type Message as MessageType } from '@/types/message'
import { useRef } from 'react'

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
      <div className='flex justify-center sticky top-2 z-10 py-2'>
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
