'use client'

import { downloadBlob } from '@/lib/messages'
import { useNetworkContext } from '@/providers/network-provider'
import { createClient } from '@/utils/supabase/client'
import type { Message } from '@chatly/types/message'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface DownloadAttachmentActionProps {
  message: Message
}

export default function DownloadAttachmentAction({
  message,
}: DownloadAttachmentActionProps) {
  const attachment = message.attachment
  const { isOnline } = useNetworkContext()

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
      className='text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed'
      onClick={handleClick}
      disabled={!attachment || !isOnline}
    >
      <Download className='h-4 w-4' />
    </Button>
  )
}
