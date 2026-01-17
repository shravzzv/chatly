export function formatRelativeDate(date: string) {
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

function pluralize(count: number, singular: string) {
  return count === 1 ? singular : `${singular}s`
}
