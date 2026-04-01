import { File, FileArchive, FileBraces, FileText } from 'lucide-react-native'
import { Icon } from './ui/icon'

interface FileAttachmentIconProps {
  mimeType: string
}

export default function FileAttachmentIcon({
  mimeType,
}: FileAttachmentIconProps) {
  const className = 'text-muted-foreground size-5'

  if (mimeType.includes('pdf')) {
    return <Icon as={FileText} className={className} />
  }

  if (mimeType.includes('json')) {
    return <Icon as={FileBraces} className={className} />
  }

  if (mimeType.includes('zip') || mimeType.includes('rar')) {
    return <Icon as={FileArchive} className={className} />
  }

  return <Icon as={File} className={className} />
}
