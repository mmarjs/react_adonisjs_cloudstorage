import { useSelector, useDispatch } from 'react-redux'
import { AppState } from 'App/reducers'
import { refreshTimestamp } from 'Data/Auth'
import { setTimeStamp } from 'Data/Share'

interface UseTokenResponse {
  token: string
  refresh: () => void
}

export default function useAuthToken(): UseTokenResponse {
  const isUserLogin = useSelector((state: AppState) => state.auth.loggedIn)
  const isShareLogin = useSelector((state: AppState) => state.share.loggedIn)
  const userToken = useSelector((state: AppState) => state.auth.token)
  const shareToken = useSelector((state: AppState) => state.share.token)
  const dispatch = useDispatch()

  const refreshAuth = () => {
    dispatch(refreshTimestamp(''))
  }

  const refreshShare = () => {
    dispatch(setTimeStamp(''))
  }

  if (isShareLogin) {
    return { token: shareToken, refresh: refreshShare }
  }

  if (isUserLogin) {
    return { token: userToken, refresh: refreshAuth }
  }
  return { token: 'no-token-present', refresh: () => {} }
}
