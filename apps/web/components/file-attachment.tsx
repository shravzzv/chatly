import type { MessageAttachment } from '@/types/message-attachment'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatFileSize, formatMimeType } from '@/lib/messages'
import FileAttachmentIcon from './file-attachment-icon'

interface FileAttachmentProps {
  attachment: MessageAttachment
  signedUrl: string
}

export default function FileAttachment({
  attachment,
  signedUrl,
}: FileAttachmentProps) {
  return (
    <div className='flex items-center gap-2 max-w-2xs rounded-2xl shadow-sm bg-transparent px-3 py-2'>
      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-background'>
        <FileAttachmentIcon mimeType={attachment.mime_type} />
      </div>

      <div className='flex-1 min-w-0'>
        <p className='line-clamp-2 text-sm font-medium'>
          {attachment.file_name}
        </p>

        <p className='text-xs text-muted-foreground'>
          <span>{formatMimeType(attachment.mime_type)}</span>
          <span> • </span>
          <span>{formatFileSize(attachment.size)}</span>
        </p>
      </div>

      <Button
        variant='outline'
        size='icon-sm'
        className='shrink-0 cursor-pointer'
        asChild
      >
        <Link href={signedUrl} download>
          <Download className='h-4 w-4' />
        </Link>
      </Button>
    </div>
  )
}
