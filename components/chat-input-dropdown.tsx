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

export default function ChatInputDropdown() {
  const { sendMessage } = useDashboardContext()
  const [open, setOpen] = useState(false)
  /**
   * Used to track attachment uploading.
   * Only one attachment is allowed to be uploaded at a time.
   */
  const [isUploading, setIsUploading] = useState(false)

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

    try {
      setIsUploading(true)

      await sendMessage({ file })
      setOpen(false)
    } catch (error) {
      toast.error('Upload failed')
      console.error(error)
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
