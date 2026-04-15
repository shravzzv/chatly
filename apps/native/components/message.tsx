import { buildMessageActions } from '@/lib/messages'
import { THEME } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/providers/auth-provider'
import type { Message as MessageType } from '@chatly/types/message'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { Download, Pen, Trash } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import { useState } from 'react'
import { Platform, Pressable, View } from 'react-native'
import DeleteMessageAction from './delete-message-action'
import EditMessageTextAction from './edit-message-text-action'
import MessageContent from './message-content'
import MessageMetadata from './message-metadata'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

interface MessageProps {
  message: MessageType
}

export function Message({ message }: MessageProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()
  const { colorScheme } = useColorScheme()
  const { id, text, attachment } = message
  const { userId, isLoading: isAuthLoading } = useAuthContext()

  const isOwn = message.sender_id === userId
  const hasAttachment = !!attachment
  const hasText = typeof text === 'string' && text.trim().length > 0
  const denySheet = !isOwn && hasText
  const allowDelete = isOwn
  const allowEdit = isOwn && hasText && !hasAttachment
  const allowDownload = !hasText && hasAttachment

  const handleDownload = () => {
    console.log(`Download message with id ${message.id}`)
  }

  const actions = buildMessageActions({
    allowEdit,
    allowDelete,
    allowDownload,
    onEdit: () => setIsEditDialogOpen(true),
    onDelete: () => setIsDeleteDialogOpen(true),
    onDownload: () => handleDownload(),
  })

  const openActionSheet = () => {
    showActionSheetWithOptions(
      {
        options: actions.map((a) => a.label),
        cancelButtonIndex: actions.findIndex((a) => a.isCancel),
        destructiveButtonIndex: actions.findIndex((a) => a.isDestructive),
        title: 'Choose an action',
        icons: actions.map((a) => (
          <Icon
            as={a.icon}
            key={a.label}
            className='size-6 text-primary-foreground'
            stroke={
              a.isDestructive
                ? colorScheme === 'dark'
                  ? THEME.dark.destructive
                  : THEME.light.destructive
                : colorScheme === 'dark'
                  ? THEME.dark.foreground
                  : THEME.light.foreground
            }
          />
        )),
        containerStyle: {
          backgroundColor:
            colorScheme === 'dark'
              ? THEME.dark.secondary
              : THEME.light.secondary,
        },
        textStyle: {
          color:
            colorScheme === 'dark'
              ? THEME.dark.foreground
              : THEME.light.foreground,
        },
        titleTextStyle: {
          color:
            colorScheme === 'dark'
              ? THEME.dark.mutedForeground
              : THEME.light.mutedForeground,
        },
        destructiveColor:
          colorScheme === 'dark'
            ? THEME.dark.destructive
            : THEME.light.destructive,
      },
      (selectedIndex) => {
        if (typeof selectedIndex === 'undefined') return
        const action = actions[selectedIndex]
        action.onPress()
      },
    )
  }

  if (isAuthLoading) return null
  if (!hasText && !hasAttachment) return null

  return (
    <View
      className={cn(
        isOwn ? 'items-end' : 'items-start',
        'w-full gap-2 rounded-lg',
      )}
    >
      <Pressable
        className={cn(
          isOwn ? 'items-end' : 'items-start',
          'w-full max-w-[80%] rounded-lg sm:max-w-[60%]',
        )}
        onLongPress={() => !denySheet && openActionSheet()}
      >
        <MessageContent message={message} isOwn={isOwn} />
      </Pressable>

      <MessageMetadata message={message} />

      {Platform.OS === 'web' && (
        <View className='flex-row items-center'>
          {allowEdit && text && (
            <Button
              variant='ghost'
              size='icon'
              className='p-0'
              onPress={() => setIsEditDialogOpen(true)}
            >
              <Icon as={Pen} className='size-4 text-muted-foreground' />
            </Button>
          )}

          {allowDelete && (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => setIsDeleteDialogOpen(true)}
            >
              <Icon as={Trash} className='size-4 text-muted-foreground' />
            </Button>
          )}

          {allowDownload && (
            <Button variant='ghost' size='icon'>
              <Icon as={Download} className='size-4 text-muted-foreground' />
            </Button>
          )}
        </View>
      )}

      {allowDelete && (
        <DeleteMessageAction
          id={id}
          open={isDeleteDialogOpen}
          setOpen={setIsDeleteDialogOpen}
        />
      )}

      {allowEdit && (
        <EditMessageTextAction
          id={id}
          text={text}
          open={isEditDialogOpen}
          setOpen={setIsEditDialogOpen}
        />
      )}
    </View>
  )
}
