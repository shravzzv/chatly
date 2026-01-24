import { Message } from '@/types/message'
import { getPartnerId } from './dashboard'

/**
 * Builds a map of the most recent message per conversation partner.
 *
 * Given a list of messages involving the current user, this function
 * derives a conversation-level aggregate where each key represents
 * a partner user and the value is the latest message exchanged with them.
 *
 * Important assumptions:
 * - `messages` **must already be ordered by `created_at` in descending order**.
 * - The first message encountered for a partner is treated as the latest one.
 *
 * This function is intentionally pure and synchronous.
 * It is commonly used to compute `lastMessages` for conversation previews
 * from an authoritative message list.
 *
 * @param messages - Messages involving the current user, sorted newest-first
 * @param currentUserId - The id of the current user
 * @returns A map keyed by partner user id, containing the latest message per conversation
 */
export const deriveLastMessagesMap = (
  messages: Message[],
  currentUserId: string,
): Record<string, Message> => {
  const map: Record<string, Message> = {}

  for (const msg of messages) {
    const partnerId = getPartnerId(msg, currentUserId)
    if (!map[partnerId]) map[partnerId] = msg
  }

  return map
}
