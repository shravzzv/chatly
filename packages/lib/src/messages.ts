import { Message } from '@chatly/types/message'

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
