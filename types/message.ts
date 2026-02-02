import { MessageAttachment } from './message-attachment'

export interface Message {
  id: string
  text: string | null
  sender_id: string
  receiver_id: string
  created_at: string
  updated_at: string
  attachment?: MessageAttachment
}
