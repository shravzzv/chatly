import type { MessageAttachmentKind } from '@/types/message-attachment'

export const getAttachmentKind = (mimeType: string): MessageAttachmentKind => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

export const formatMimeType = (mimeType: string) => {
  return mimeType.split('/')[1]?.toUpperCase() ?? mimeType
}

/**
 * Triggers a client-side download for a given Blob.
 *
 * Browsers do not expose a high-level "download this blob" API.
 * The only supported mechanism is to:
 *   1. Create an object URL for the Blob
 *   2. Attach it to an `<a download>` element
 *   3. Programmatically trigger a click
 *
 * This function intentionally performs those low-level DOM operations
 * at a clear abstraction boundary.
 *
 * Important constraints:
 * - Must be called in response to a user gesture (e.g. click), otherwise
 *   browsers may block the download.
 * - Uses `URL.createObjectURL`, so the caller does NOT need to manage
 *   content headers or signed URLs.
 * - The object URL is revoked immediately after the click to avoid
 *   memory leaks.
 *
 * Browser behavior notes:
 * - Some mobile browsers may show a security warning for downloaded files,
 *   especially for blobs without a known origin or MIME type.
 * - This is expected behavior and not an indicator of an unsafe download.
 *
 * @param blob - The binary data to download.
 * @param filename - Suggested filename for the downloaded file.
 */
export const downloadBlob = async (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = filename ?? 'download'
  document.body.appendChild(a)
  a.click()

  // Delay cleanup to ensure the click is fully processed by the browser
  setTimeout(() => {
    URL.revokeObjectURL(url)
    a.remove()
  }, 0)
}
