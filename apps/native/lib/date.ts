export const formatDateHeader = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const messageDate = new Date(date)
  messageDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  yesterday.setHours(0, 0, 0, 0)

  if (messageDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return messageDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

/**
 * Formats a number of seconds into a hh:mm:ss format.
 * Numbers are padded to ensure double digits and hours are added only if present.
 *
 * @param seconds the number of seconds to format.
 * @returns a formatted time string as 'hh:mm:ss', for example `'01:03:56'` or `'01:56'`.
 */
export const getFormattedSeconds = (seconds: number) => {
  if (seconds < 0) return '00:00'
  const totalSeconds = Math.floor(seconds)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')

  return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`
}
