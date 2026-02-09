function pluralize(count: number, singular: string) {
  return count === 1 ? singular : `${singular}s`
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getNextUtcMidnight() {
  const now = new Date()
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
    ),
  )
  return next
}

export const formatRelativeDate = (date: string) => {
  const target = new Date(date)
  const now = new Date()

  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return null
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays < 7) {
    return `in ${diffDays} ${pluralize(diffDays, 'day')}`
  }
  if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7)
    return `in ${weeks} ${pluralize(weeks, 'week')}`
  }
  const months = Math.round(diffDays / 30)
  return `in ${months} ${pluralize(months, 'month')}`
}

export const formatEditedTimestamp = (createdAt: string, updatedAt: string) => {
  const created = new Date(createdAt)
  const updated = new Date(updatedAt)

  // Same day → time only
  if (isSameDay(created, updated)) {
    return updated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Different day → date + time
  return updated.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
 * Returns the local clock time at which daily usage resets.
 *
 * Usage resets at midnight UTC; this converts that moment
 * into the user's local time for display.
 */
export const getUsageResetTime = () => {
  const resetAt = getNextUtcMidnight()

  return resetAt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
