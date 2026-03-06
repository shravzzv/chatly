import { Message } from '@/types/message'
import { Preview, Previews } from '@/types/use-previews'
import { getPartnerId } from './dashboard'
import { MessageAttachment } from '@/types/message-attachment'

/**
 * Derives a conversation-level preview map from a list of messages.
 *
 * Given a list of messages involving the current user, this function
 * builds a projection optimized for conversation lists (previews):
 * one entry per conversation partner representing the **most recent
 * conversation activity**, not necessarily the most recently created message.
 *
 * Preview semantics:
 * - A preview reflects the latest *activity* in a conversation
 *   (send, receive, edit, or attachment completion).
 * - Preview text is derived via internal preview rules.
 * - Preview freshness and ordering are determined by `updated_at`.
 *
 * Important assumptions:
 * - `messages` **must already be ordered by `updated_at` in descending order**.
 * - The first message encountered for a partner is treated as the
 *   authoritative preview source for that conversation.
 *
 * Design notes:
 * - This function is intentionally pure and synchronous.
 * - It performs no sorting or filtering beyond first-seen aggregation.
 * - Absence of a partner key in the returned map implies no messages
 *   exist for that conversation.
 *
 * @param messages - Messages involving the current user, sorted newest-first by `updated_at`
 * @param currentUserId - The id of the current user
 * @returns A map keyed by partner user id, containing derived conversation previews
 */
export const derivePreviews = (
  messages: Message[],
  currentUserId: string,
): Previews => {
  const previews: Previews = {}

  for (const msg of messages) {
    const partnerId = getPartnerId(msg, currentUserId)

    if (!previews[partnerId]) {
      previews[partnerId] = derivePreview(msg, currentUserId)
    }
  }

  return previews
}

/**
 * Derives a single conversation preview from a message.
 *
 * This function projects a full {@link Message} entity into a lightweight
 * preview suitable for conversation lists.
 *
 * The resulting preview:
 * - contains only user-visible summary information
 * - reflects the message's latest activity via `updated_at`
 * - delegates preview text derivation to internal rules
 *
 * @param message - The message used to derive the preview
 * @param currentUserId
 * @returns A normalized conversation preview
 */
export const derivePreview = (
  message: Message,
  currentUserId: string,
): Preview => ({
  text: getMessagePreview(message),
  updatedAt: message.updated_at,
  isOwnMsg: message.sender_id === currentUserId,
})

/**
 * Derives a human-readable preview string for a message.
 *
 * Preview rules:
 * - If the message contains non-empty text, that text is used verbatim.
 * - If the message has no text but includes an attachment, a
 *   type-specific attachment label is used instead.
 * - As a defensive fallback, a generic placeholder is returned.
 *
 * @param msg - The message from which to derive preview text
 * @returns A human-readable preview string
 */
export const getMessagePreview = (msg: Message): string => {
  if (msg.text && msg.text.trim().length > 0) {
    return msg.text
  }

  if (msg.attachment) {
    return getAttachmentPreview(msg.attachment)
  }

  return 'Message'
}

/**
 * Returns a short, human-readable preview label for a message attachment.
 *
 * Attachment previews are intentionally coarse-grained and icon-prefixed
 * to support fast scanning in conversation lists without exposing
 * attachment metadata or filenames.
 *
 * This function is private to the previews module to allow future
 * changes to preview semantics without affecting consumers.
 *
 * @param attachment - The attachment associated with a message
 * @returns A human-readable attachment preview label
 */
const getAttachmentPreview = (attachment: MessageAttachment) => {
  const mimeType = attachment.mime_type

  if (mimeType.startsWith('image/')) return '🖼️ Image'
  if (mimeType.startsWith('video/')) return '🎥 Video'
  if (mimeType.startsWith('audio/')) return '🎵 Audio'
  return '📎 Attachment'
}
