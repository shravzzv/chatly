import { MessageAttachment } from '@/types/message-attachment'
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
      className='max-w-3xs md:max-w-2xs rounded-2xl shadow-sm object-cover max-h-screen bg-transparent'
      sizes='(max-width: 640px) 70vw, 320px'
      loading='lazy'
    />
  )
}
