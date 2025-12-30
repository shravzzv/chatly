// This file contains helper functions used in the app/(private)/dashboard/page.tsx

import { Message } from '@/types/message'
import { Profile } from '@/types/profile'

export const groupMessagesByDate = (messages: Message[]) => {
  const groups: { date: string; messages: Message[] }[] = []
  const groupMap = new Map<string, Message[]>()

  messages.forEach((msg) => {
    const dateKey = new Date(msg.created_at).toISOString().split('T')[0]
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, [])
    }
    groupMap.get(dateKey)!.push(msg)
  })

  Array.from(groupMap.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .forEach(([date, msgs]) => {
      groups.push({ date, messages: msgs })
    })

  return groups
}

export const getDisplayName = (profile: Profile) => {
  if (profile.name) return profile.name
  if (profile.username) return profile.username
  return `User ${profile.user_id.slice(0, 4).toUpperCase()}`
}

export const formatDateHeader = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const messageDate = new Date(date)
  messageDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  if (messageDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return messageDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

/**
 * Determines the partner ID from a message based on the current user's ID.
 *
 * @param msg - The message object containing sender and receiver information
 * @param currentUserId - The ID of the current user
 * @returns The ID of the message partner (the other user in the conversation)
 *
 * @remarks
 * - If the current user sent a message to themselves, returns their own ID, otherwise:
 * - If the current user is the sender, returns the receiver's ID.
 * - If the current user is the receiver, returns the sender's ID.
 */
export const getPartnerId = (msg: Message, currentUserId: string) => {
  return currentUserId === msg.sender_id ? msg.receiver_id : msg.sender_id
}
