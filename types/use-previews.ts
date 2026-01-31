import { type PostgrestError } from '@supabase/supabase-js'
import { type Message } from './message'

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
}

/**
 * A mapping of conversation partner id → preview.
 *
 * Absence of a key implies that no messages exist for that conversation.
 */
export type Previews = Record<string, Preview>

/**
 * Public API returned by the `usePreviews` hook.
 *
 * This hook exposes a derived, read-optimized projection of message data
 * suitable for conversation lists, along with command-style helpers for
 * keeping previews in sync with message lifecycle events.
 *
 * Responsibilities:
 * - expose preview state and loading/error information
 * - support optimistic updates for new or edited messages
 * - reconcile previews after destructive operations
 *
 * Non-responsibilities:
 * - does not perform message CRUD
 * - does not decide how errors are presented to users
 * - does not contain UI or formatting logic
 */
export interface UsePreviewsResult {
  /**
   * Conversation previews keyed by partner user id.
   *
   * This object is safe to consume directly in render logic.
   */
  previews: Previews

  /**
   * Indicates whether previews are currently being loaded
   * from the authoritative data source.
   */
  loading: boolean

  /**
   * The last error encountered while fetching or rebuilding previews,
   * if any.
   *
   * This represents a data-layer failure; consumers are responsible
   * for deciding how (or if) the error should be surfaced in the UI.
   */
  error: PostgrestError | null

  /**
   * Updates or inserts a preview based on a message.
   *
   * This method performs an optimistic upsert:
   * - if no preview exists for the message's conversation, one is created
   * - if a preview exists, it is updated only if the message represents
   *   more recent activity
   *
   * Intended to be called when messages are sent, received, edited,
   * or finalized after attachment uploads.
   *
   * @param message - The message causing preview-worthy activity
   */
  updatePreview: (message: Message) => void

  /**
   * Reconciles previews after a message has been deleted.
   *
   * Behavior:
   * - If the deleted message was not the current preview source,
   *   no update is performed.
   * - If it was, the preview is rebuilt from the authoritative source.
   * - If no messages remain, the preview is removed.
   *
   * This method is authoritative and may perform a database query.
   *
   * @param deletedMsg - The message that was successfully deleted
   */
  deletePreview: (deletedMsg: Message) => Promise<void>

  /**
   * Authoritatively replaces or removes a preview for a conversation.
   *
   * This function bypasses freshness checks and optimistic safeguards.
   * Callers are expected to supply an authoritative message or `null`.
   *
   * Intended for:
   * - rollback after failed optimistic updates
   * - recomputation after destructive operations
   * - realtime reconciliation when ordering guarantees are violated
   *
   * @param partnerId - The conversation partner id
   * @param message - The authoritative message to derive a preview from,
   * or `null` to remove the preview entirely
   */
  replacePreview: (partnerId: string, message: Message | null) => void
}
