import { MessageAttachment } from '@/types/message-attachment'
import { useEffect, useState } from 'react'
import { Image } from 'react-native'

interface ImageAttachmentProps {
  attachment: MessageAttachment
  signedUrl: string
}

export default function ImageAttachment({
  attachment,
  signedUrl,
}: ImageAttachmentProps) {
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    Image.getSize(signedUrl, (width, height) => {
      setAspectRatio(width / height)
    })
  }, [signedUrl])

  return (
    <Image
      source={{ uri: signedUrl }}
      className='max-h-[70vh] w-full rounded-2xl bg-transparent shadow-sm md:max-w-xs'
      style={{ aspectRatio }}
    />
  )
}
