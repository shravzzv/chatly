/**
 * A lightweight, conversation-level projection used for rendering
 * conversation lists and inbox previews.
 *
 * A `Preview` represents the most recent *activity* in a conversation,
 * not necessarily the most recently created message.
 *
 * Semantics:
 * - `text` is a human-readable summary derived from the latest message
 *   (text content or attachment label).
 * - `updatedAt` reflects the timestamp of the latest conversation activity
 *   (send, receive, edit, or attachment completion).
 *
 * This type intentionally excludes message-level details such as ids,
 * sender information, or attachment metadata.
 */
export interface Preview {
  text: string
  updatedAt: string
  isOwnMsg: boolean
}

/**
 * A mapping of conversation partner id → preview.
 *
 * Absence of a key implies that no messages exist for that conversation.
 */
export type Previews = Record<string, Preview>
