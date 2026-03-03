import { type PostgrestError } from '@supabase/supabase-js'
import { type Message } from './message'

/**
 * Input payload for sending a message.
 *
 * A message may contain:
 * - text only, or
 * - a file only
 *
 * Providing both is not supported.
 * If neither is provided, the send operation is a no-op.
 */
export type SendMessageInput =
  | { text: string; file?: never }
  | { file: File; text?: never }

/**
 * Command for sending a message.
 *
 * This function performs:
 * - optimistic UI updates for messages
 * - authoritative database writes
 * - attachment upload (if provided)
 *
 * Errors are thrown and must be handled by the caller.
 */
type SendMessage = (input: SendMessageInput) => Promise<void>
export default SendMessage

/**
 * Public API returned by `useMessages`.
 *
 * This hook owns **conversation-local message state** and exposes
 * a small set of **commands** for mutating that state.
 *
 * Responsibilities:
 * - Fetch messages for the active conversation
 * - Manage optimistic UI updates for send/edit/delete
 * - Reconcile state with authoritative database responses
 * - React to realtime database events
 *
 * Non-responsibilities:
 * - It does NOT own conversation previews
 * - It does NOT decide how errors are surfaced to the user
 * - It does NOT manage global or cross-conversation state
 *
 * Consumers should treat:
 * - `messages` as the authoritative list for the active conversation
 * - command methods as intent-driven operations that may throw on failure
 */
export interface UseMessagesResult {
  /** Messages for the currently selected conversation */
  messages: Message[]

  /** Indicates whether messages are currently being fetched */
  loading: boolean

  /** Error encountered while fetching messages */
  error: PostgrestError | null

  /**
   * Sends a new message in the active conversation.
   *
   * Behavior:
   * - Inserts an optimistic message into `messages`
   * - Persists the message to the database
   * - Uploads and attaches a file if provided
   * - Reconciles optimistic state with authoritative data
   *
   * On failure:
   * - The optimistic message is removed
   * - The error is thrown to the caller
   */
  sendMessage: SendMessage

  /**
   * Deletes a message by id.
   *
   * Behavior:
   * - Optimistically removes the message from `messages`
   * - Commits the deletion to the database
   * - Cleans up attachment storage on a best-effort basis
   * - Updates conversation previews only after DB success
   *
   * On failure:
   * - Message state is rolled back
   * - The error is thrown to the caller
   */
  deleteMessage: (id: string) => Promise<void>

  /**
   * Edits the text of an existing message.
   *
   * Behavior:
   * - Optimistically updates message text in `messages`
   * - Commits the update to the database
   * - Reconciles local state with the authoritative response
   * - Updates conversation previews after confirmed success
   *
   * On failure:
   * - Message state is rolled back
   * - The error is thrown to the caller
   */
  editMessage: (id: string, text: string) => Promise<void>
}

/**
 * Arguments required by `useMessages`.
 *
 * These callbacks allow the hook to notify external systems
 * (e.g. conversation previews) about **authoritative message changes**
 * without owning that state itself.
 *
 * This keeps message state local and preview state global.
 */
export interface UseMessagesArgs {
  /**
   * The currently active conversation partner.
   *
   * When `null`, no messages are fetched and the message list is cleared.
   */
  selectedProfileId: string | null

  /**
   * Called when a message is confirmed or received via realtime.
   *
   * Intended to update conversation previews based on authoritative data.
   */
  updatePreview: (msg: Message) => void

  /**
   * Called after a message has been successfully deleted.
   *
   * Intended to reconcile conversation previews from an authoritative source.
   */
  deletePreview: (msg: Message) => Promise<void>
}
