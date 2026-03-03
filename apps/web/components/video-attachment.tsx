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
      className='max-w-3xs md:max-w-2xs rounded-2xl shadow-sm bg-transparent object-contain max-h-screen overflow-hidden'
    />
  )
}
