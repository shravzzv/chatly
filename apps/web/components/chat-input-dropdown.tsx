'use client'

import { useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  AudioLines,
  Clapperboard,
  ImagePlus,
  Paperclip,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import type { MessageAttachmentKind } from '@/types/message-attachment'
import { MAX_MESSAGE_ATTACHMENT_SIZE } from '@/data/constants'
import { useDashboardContext } from '@/providers/dashboard-provider'
import { PLAN_LIMITS } from '@/data/plans'

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
            className='rounded-full cursor-pointer'
            aria-label='Add attachment'
          >
            <Plus className='w-5 h-5' />
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
            className='flex items-center gap-2 cursor-pointer'
            onSelect={(e) => triggerPicker(e, imageInputRef)}
            disabled={isUploading}
          >
            <ImagePlus className='w-4 h-4 text-muted-foreground' />
            Image
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex items-center gap-2 cursor-pointer'
            onSelect={(e) => triggerPicker(e, videoInputRef)}
            disabled={isUploading}
          >
            <Clapperboard className='w-4 h-4 text-muted-foreground' />
            Video
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex items-center gap-2 cursor-pointer'
            onSelect={(e) => triggerPicker(e, audioInputRef)}
            disabled={isUploading}
          >
            <AudioLines className='w-4 h-4 text-muted-foreground' />
            Audio
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex items-center gap-2 cursor-pointer'
            onSelect={(e) => triggerPicker(e, fileInputRef)}
            disabled={isUploading}
          >
            <Paperclip className='w-4 h-4 text-muted-foreground' />
            File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
