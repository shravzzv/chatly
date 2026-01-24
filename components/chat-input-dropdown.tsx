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
import { AudioLines, ImagePlus, Paperclip, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function ChatInputDropdown() {
  const [open, setOpen] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'audio' | 'file',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.success(`${type} selected`)
    setOpen(false)
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
      />
      <input
        ref={audioInputRef}
        type='file'
        accept='audio/*'
        className='sr-only'
        onChange={(e) => handleFileChange(e, 'audio')}
      />
      <input
        ref={fileInputRef}
        type='file'
        className='sr-only'
        onChange={(e) => handleFileChange(e, 'file')}
      />

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
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
          >
            <ImagePlus className='w-4 h-4 text-muted-foreground' />
            Image
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex items-center gap-2 cursor-pointer'
            onSelect={(e) => triggerPicker(e, audioInputRef)}
          >
            <AudioLines className='w-4 h-4 text-muted-foreground' />
            Audio
          </DropdownMenuItem>

          <DropdownMenuItem
            className='flex items-center gap-2 cursor-pointer'
            onSelect={(e) => triggerPicker(e, fileInputRef)}
          >
            <Paperclip className='w-4 h-4 text-muted-foreground' />
            File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
