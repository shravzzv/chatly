import { File, FileArchive, FileText } from 'lucide-react'

interface FileAttachmentIconProps {
  mimeType: string
}

export default function FileAttachmentIcon({
  mimeType,
}: FileAttachmentIconProps) {
  const className = 'h-5 w-5 text-muted-foreground'

  if (mimeType.includes('pdf')) {
    return <FileText className={className} />
  }

  if (mimeType.includes('zip') || mimeType.includes('rar')) {
    return <FileArchive className={className} />
  }

  return <File className={className} />
}
