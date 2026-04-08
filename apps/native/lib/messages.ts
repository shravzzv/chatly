import type { Message } from '@/types/message'
import { Download, Pen, Trash, X, type LucideIcon } from 'lucide-react-native'

interface Action {
  label: string
  icon: LucideIcon
  onPress: () => void
  isDestructive?: boolean
  isCancel?: boolean
}

/**
 * Builds the actions required for a message's action sheet.
 *
 * @returns an actions array with the configured actions.
 */
export const buildMessageActions = ({
  allowEdit,
  allowDelete,
  allowDownload,
  onEdit,
  onDelete,
  onDownload,
}: {
  allowEdit: boolean
  allowDelete: boolean
  allowDownload: boolean
  onEdit: () => void
  onDelete: () => void
  onDownload: () => void
}) => {
  const actions: Action[] = []

  if (allowEdit) {
    actions.push({
      label: 'Edit',
      onPress: onEdit,
      icon: Pen,
    })
  }

  if (allowDelete) {
    actions.push({
      label: 'Delete',
      onPress: onDelete,
      isDestructive: true,
      icon: Trash,
    })
  }

  if (allowDownload) {
    actions.push({
      label: 'Download',
      onPress: onDownload,
      icon: Download,
    })
  }

  // Cancel should be the last action pushed.
  actions.push({
    label: 'Cancel',
    onPress: () => {},
    isCancel: true,
    icon: X,
  })

  return actions
}

export const groupMessagesByDate = (messages: Message[]) => {
  const groups: { date: string; data: Message[] }[] = []
  const groupMap = new Map<string, Message[]>()

  messages.forEach((msg) => {
    const dateKey = new Date(msg.created_at).toISOString().split('T')[0]
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, [])
    }
    groupMap.get(dateKey)!.push(msg)
  })

  Array.from(groupMap.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .forEach(([date, msgs]) => {
      groups.push({ date, data: msgs })
    })

  return groups
}
