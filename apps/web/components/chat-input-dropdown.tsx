'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MAX_MESSAGE_ATTACHMENT_SIZE } from '@/data/constants'
import { PLAN_LIMITS } from '@/data/plans'
import { useDashboardContext } from '@/providers/dashboard-provider'
import type { MessageAttachmentKind } from '@chatly/types/message-attachment'
import {
  AudioLines,
  Clapperboard,
  ImagePlus,
  Paperclip,
  Plus,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function ChatInputDropdown() {
  const { sendMessage } = useDashboardContext()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const {
    plan,
    mediaUsed,
    canUseMedia,
    openUpgradeAlertDialog,
    reflectUsageIncrement,
  } = useDashboardContext()

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: MessageAttachmentKind,
  ) => {
    if (isUploading) return

    const file = e.target.files?.[0]
    if (!file) return

    if (kind !== 'file' && !file.type.startsWith(`${kind}`)) {
      toast.error(`Please upload a valid ${kind} file`)
      e.target.value = ''
      return
    }

    if (file.size > MAX_MESSAGE_ATTACHMENT_SIZE) {
      toast.error('File must be at most 50 MB')
      e.target.value = ''
      return
    }

    setIsUploading(true)

    try {
      await sendMessage({ file })
      reflectUsageIncrement('media')
      setOpen(false)
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        switch (error.message) {
          case 'USER_ON_FREE_PLAN':
            toast.error('Upgrade your plan to send media attachments')
            break
          case 'USAGE_LIMIT_EXCEEDED':
            toast.error('Daily media attachments limit reached')
            break
          default:
            toast.error('Upload failed')
        }
      }
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const triggerPicker = (
    e: Event,
    ref: React.RefObject<HTMLInputElement | null>,
  ) => {
    e.preventDefault()
    if (!canUseMedia) {
      openUpgradeAlertDialog('media')
      return
    }

    if (!ref.current) return
    ref.current.click()
  }

  return (
    <>
      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type='file'
        accept='image/*'
        className='sr-only'
        onChange={(e) => handleFileChange(e, 'image')}
        disabled={isUploading}
      />
      <input
        ref={videoInputRef}
        type='file'
        accept='video/*'
        className='sr-only'
        onChange={(e) => handleFileChange(e, 'video')}
        disabled={isUploading}
      />
      <input
        ref={audioInputRef}
        type='file'
        accept='audio/*'
        className='sr-only'
        onChange={(e) => handleFileChange(e, 'audio')}
        disabled={isUploading}
      />
      <input
        ref={fileInputRef}
        type='file'
        accept='*'
        className='sr-only'
        onChange={(e) => handleFileChange(e, 'file')}
        disabled={isUploading}
      />

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={isUploading}>
          <Button
            variant='secondary'
            size='icon-lg'
            className='cursor-pointer rounded-full'
            aria-label='Add attachment'
          >
            <Plus className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start'>
          <DropdownMenuLabel>Attachments</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canUseMedia && (
            <>
              <DropdownMenuLabel>
                {mediaUsed}/{PLAN_LIMITS[plan].media} today
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2'
            onSelect={(e) => triggerPicker(e, imageInputRef)}
            disabled={isUploading}
          >
            <ImagePlus className='text-muted-foreground h-4 w-4' />
            Image
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2'
            onSelect={(e) => triggerPicker(e, videoInputRef)}
            disabled={isUploading}
          >
            <Clapperboard className='text-muted-foreground h-4 w-4' />
            Video
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2'
            onSelect={(e) => triggerPicker(e, audioInputRef)}
            disabled={isUploading}
          >
            <AudioLines className='text-muted-foreground h-4 w-4' />
            Audio
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2'
            onSelect={(e) => triggerPicker(e, fileInputRef)}
            disabled={isUploading}
          >
            <Paperclip className='text-muted-foreground h-4 w-4' />
            File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
