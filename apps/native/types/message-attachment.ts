export interface MessageAttachment {
  id: string
  message_id: string
  path: string
  file_name: string
  mime_type: string
  size: number
  created_at: string
}

export type MessageAttachmentKind = 'image' | 'video' | 'audio' | 'file'
