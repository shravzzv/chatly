interface AudioAttachmentProps {
  signedUrl: string
}

export default function AudioAttachment({ signedUrl }: AudioAttachmentProps) {
  return (
    <audio
      src={signedUrl}
      controls
      controlsList='nodownload'
      className='max-w-full rounded-2xl bg-transparent shadow-sm'
    />
  )
}
