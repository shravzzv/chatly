'use client'

import { Download } from 'lucide-react'
import { Button } from './ui/button'
import { Message } from '@/types/message'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/messages'

interface DownloadAttachmentActionProps {
  message: Message
}

export default function DownloadAttachmentAction({
  message,
}: DownloadAttachmentActionProps) {
  const attachment = message.attachment

  const handleClick = async () => {
    if (!attachment) return

    const supabase = createClient()
    const { data: blob, error } = await supabase.storage
      .from('message_attachments')
      .download(attachment.path)

    if (error || !blob) {
      toast.error('Download failed')
      return
    }

    await downloadBlob(blob, attachment.file_name)
  }

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      className='cursor-pointer text-muted-foreground hover:text-foreground'
      onClick={handleClick}
      disabled={!attachment}
    >
      <Download className='h-4 w-4' />
    </Button>
  )
}
