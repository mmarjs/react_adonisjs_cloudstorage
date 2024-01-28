import React from 'react'
import { useHistory } from 'react-router-dom'
import { isExpired, LOGIN_URL } from 'Lib'
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from 'App/reducers'
import { SHARE_LOGIN_URL } from './urls'

interface Props {
  gate: 'main' | 'share'
  children: React.ReactNode
}

export function ExpiryGuard(props: Props) {
  const { gate, children } = props
  const dispatch = useDispatch()
  const history = useHistory()
  const authTimeStamp = useSelector((state: AppState) => state.auth.timestamp)
  const shareTimeStamp = useSelector((state: AppState) => state.share.timestamp)
  const shareLink = useSelector((state: AppState) => state.share.shareLink)

  if (gate === 'main') {
    if (authTimeStamp === undefined || isExpired(authTimeStamp)) {
      dispatch({ type: 'RESET' })
      history.push(LOGIN_URL)
    }
  }

  if (gate === 'share') {
    if (shareTimeStamp === undefined || isExpired(shareTimeStamp)) {
      const link = shareLink?.link ?? 'none'
      dispatch({ type: 'RESET' })
      history.push(`${SHARE_LOGIN_URL}/${link}`)
      return <></>
    }
  }

  return <>{children}</>
}
