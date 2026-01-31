/**
 * Presence payload used for typing indicators.
 *
 * Each connected user advertises:
 * - their own user id
 * - who they are currently typing *to*, if anyone
 *
 * This state is ephemeral and lives only in Supabase Presence,
 * never in the database.
 */
export interface TypingState {
  /** The user emitting this presence entry */
  user_id: string

  /**
   * The user this person is currently typing to.
   * - `null` means "not typing to anyone"
   */
  typing_to: string | null
}

export interface UseTypingResult {
  /**
   * Indicates whether the *chat patner* (the person you are chatting with)
   * is currently typing a message *to the local user*.
   *
   * This value is:
   * - Always a boolean
   * - Derived from realtime presence state
   * - Safe to use directly in render logic
   *
   * Example:
   * ```tsx
   * {isTyping && <TypingIndicator />}
   * ```
   */
  isTyping: boolean

  /**
   * Updates the local user's typing status for the current chat context.
   *
   * Intended to be called from input handlers such as:
   * - `onChange`
   * - `onKeyDown`
   * - `onFocus` / `onBlur`
   *
   * Behavior:
   * - When `true`, advertises that the local user is typing to `partnerId`
   * - When `false`, clears the typing state
   *
   * This update:
   * - Uses Supabase Realtime Presence
   * - Is ephemeral (not persisted)
   * - Is broadcast to other connected clients
   */
  updateTypingStatus: (isTyping: boolean) => Promise<void>
}
