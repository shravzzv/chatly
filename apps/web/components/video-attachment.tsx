interface VideoAttachmentProps {
  signedUrl: string
}

export default function VideoAttachment({ signedUrl }: VideoAttachmentProps) {
  return (
    <video
      src={signedUrl}
      muted
      controls
      playsInline
      preload='metadata'
      controlsList='nodownload'
      className='max-h-screen max-w-3xs overflow-hidden rounded-2xl bg-transparent object-contain shadow-sm md:max-w-2xs'
    />
  )
}
