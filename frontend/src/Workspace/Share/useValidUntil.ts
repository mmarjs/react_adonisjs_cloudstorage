import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { AppState } from 'App/reducers'

export default function useValidUntil(): string {
  const expiresAt = useSelector((state: AppState) => state.share.shareLink.expires_at)

  if (expiresAt === null) {
    return 'Forever'
  }

  try {
    return dayjs(expiresAt).format('MMMM D, YYYY')
  } catch (_) {}

  return 'Unknown'
}
