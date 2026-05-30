import { formatFileSize, formatMimeType } from '@chatly/lib/messages'
import type { MessageAttachment } from '@chatly/types/message-attachment'
import FileAttachmentIcon from './file-attachment-icon'

interface FileAttachmentProps {
  attachment: MessageAttachment
}

export default function FileAttachment({ attachment }: FileAttachmentProps) {
  return (
    <div className='border-border flex max-w-2xs items-center gap-2 rounded-2xl border bg-transparent px-3 py-2 pr-5 shadow-sm'>
      <div className='bg-background flex h-10 w-10 items-center justify-center rounded-lg'>
        <FileAttachmentIcon mimeType={attachment.mime_type} />
      </div>

      <div className='min-w-0 flex-1'>
        <p className='line-clamp-2 text-sm font-medium'>
          {attachment.file_name}
        </p>

        <p className='text-muted-foreground text-xs'>
          <span>{formatMimeType(attachment.mime_type)}</span>
          <span> • </span>
          <span>{formatFileSize(attachment.size)}</span>
        </p>
      </div>
    </div>
  )
}
