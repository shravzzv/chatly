import type { MessageAttachment } from '@chatly/types/message-attachment'
import Image from 'next/image'

interface ImageAttachmentProps {
  attachment: MessageAttachment
  signedUrl: string
}

export default function ImageAttachment({
  attachment,
  signedUrl,
}: ImageAttachmentProps) {
  return (
    <Image
      src={signedUrl}
      alt={attachment.file_name || 'Image attachment'}
      width={320}
      height={320}
      className='max-h-screen max-w-3xs rounded-2xl bg-transparent object-cover shadow-sm md:max-w-2xs'
      sizes='(max-width: 640px) 70vw, 320px'
      loading='lazy'
    />
  )
}
