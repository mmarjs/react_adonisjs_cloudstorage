import { useRef, useEffect } from 'react'
import { Router } from './Router'
import CssBaseline from '@material-ui/core/CssBaseline'
import useNotification from 'Notification/useNotification'
import Pusher from 'pusher-js'
import { useIsMounted } from 'Lib'

function App() {
  const { isMounted } = useIsMounted()
  const pusher = useRef<Pusher | null>(null)
  const { loggedIn, startPusher, userChannel, companyChannel } = useNotification()

  useEffect(() => {
    if (isMounted && loggedIn && userChannel !== '' && companyChannel !== '') {
      startPusher(pusher)
    }

    return () => {
      if (pusher.current !== null) {
        pusher.current.disconnect()
      }
    }
  }, [isMounted, loggedIn, userChannel, companyChannel])

  return (
    <>
      <CssBaseline />
      <Router />
    </>
  )
}

export default App
