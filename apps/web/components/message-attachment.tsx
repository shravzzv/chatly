'use client'

import ImageAttachment from './image-attachment'
import AudioAttachment from './audio-attachment'
import FileAttachment from './file-attachment'
import { getAttachmentKind } from '@/lib/messages'
import type { MessageAttachment } from '@/types/message-attachment'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import MessageAttachmentSkeleton from './skeletons/message-attachment-skeleton'
import VideoAttachment from './video-attachment'
import MessageAttachmentAlert from './message-attachment-alert'

interface MessageAttachmentProps {
  attachment: MessageAttachment
}

export default function MessageAttachment({
  attachment,
}: MessageAttachmentProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isResolvingUrl, setIsResolvingUrl] = useState(true)

  const attachmentKind = getAttachmentKind(attachment.mime_type)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const URL_EXPIRY_SEC = 3600 // 1 hour
  const REGENERATE_BUFFER_SEC = 60 // 1 minute

  const regnerateSignedUrl = useCallback(async () => {
    setIsResolvingUrl(true)
    setIsError(false)

    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('message_attachments')
      .createSignedUrl(attachment.path, URL_EXPIRY_SEC)

    if (error) {
      setIsError(true)
      setIsResolvingUrl(false)
      return
    }

    setSignedUrl(data.signedUrl)
    setIsResolvingUrl(false)
  }, [attachment.path])

  /**
   * Fetch signed url on mount.
   */
  useEffect(() => {
    const generateSignedUrl = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('message_attachments')
        .createSignedUrl(attachment.path, URL_EXPIRY_SEC)

      if (error) {
        setIsError(true)
        setIsResolvingUrl(false)
        return
      }

      setSignedUrl(data.signedUrl)
      setIsResolvingUrl(false)
    }

    generateSignedUrl()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [attachment.path])

  /**
   * Setup a timer to regenerate signed url with a buffer before expiry.
   */
  useEffect(() => {
    if (!signedUrl) return
    const delayMs = (URL_EXPIRY_SEC - REGENERATE_BUFFER_SEC) * 1000 // 59 minutes
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(regnerateSignedUrl, delayMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [regnerateSignedUrl, signedUrl])

  if (isResolvingUrl) {
    return <MessageAttachmentSkeleton kind={attachmentKind} />
  }

  if (isError || !signedUrl) {
    return (
      <MessageAttachmentAlert
        attachmentKind={attachmentKind}
        onRetry={regnerateSignedUrl}
      />
    )
  }

  switch (attachmentKind) {
    case 'image':
      return <ImageAttachment attachment={attachment} signedUrl={signedUrl} />
    case 'video':
      return <VideoAttachment signedUrl={signedUrl} />
    case 'audio':
      return <AudioAttachment signedUrl={signedUrl} />
    default:
      return <FileAttachment attachment={attachment} signedUrl={signedUrl} />
  }
}
