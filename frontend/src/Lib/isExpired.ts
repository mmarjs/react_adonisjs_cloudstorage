import dayjs from 'dayjs'

export function isExpired(timestamp?: string): boolean {
  if (!timestamp) {
    return true
  }

  const last = dayjs(timestamp)
  const now = dayjs()
  const diff = now.diff(last, 'seconds')

  if (diff > 3600) {
    return true
  }

  return false
}
