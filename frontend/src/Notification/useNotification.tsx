import { useContext } from 'react'

/** Data */
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'App/reducers'
import { setNotifications } from 'Data/Notifications'
import { StatusContext } from 'App/StatusProvider'

/** Helpers */
import Pusher from 'pusher-js'
import { useAxios } from 'Lib'
import { Notification, PusherEvent } from 'types'
import { hasBrowserNotificationPermission, sendNotification } from 'Lib/notification'

export default function useNotification() {
  const axios = useAxios()
  const dispatch = useDispatch()
  const { showStatus } = useContext(StatusContext)
  const loggedIn = useSelector((state: AppState) => state.auth.loggedIn)
  const companyChannel = useSelector((state: AppState) => state.company.channel)
  const userChannel = useSelector((state: AppState) => state.user.channel)
  const key = process.env.REACT_APP_PUSHER_KEY as string

  const showNotification = (data: PusherEvent) => {
    if (hasBrowserNotificationPermission()) {
      sendNotification(data.subject, data.message)
    } else {
      showStatus(data.subject, 'info', 'top', 'right')
    }
  }

  const startPusher = (pusher: React.MutableRefObject<Pusher | null>) => {
    pusher.current = new Pusher(key, {
      cluster: 'mt1',
      forceTLS: true,
    })

    const channel = `${companyChannel}-${userChannel}`

    var ch = pusher.current.subscribe(channel)

    ch.bind('notifications', (data: PusherEvent) => {
      loadNotifications().then(() => {
        showNotification(data)
      })
    })
  }

  const loadNotifications = async () => {
    try {
      const { data } = await axios.get<Notification[]>('/notifications')
      dispatch(setNotifications(data))
    } catch (err) {
      showStatus('Failed to load notifications', 'error')
    }
  }

  const dismissNotification = async (id: number) => {
    try {
      await axios.put(`/notifications/${id}/dismiss`)
      await loadNotifications()
    } catch (err) {
      showStatus('Failed to dismiss notification', 'error')
    }
  }

  const dismissAllNotifications = async () => {
    try {
      await axios.put('/notifications/dismiss_all')
      await loadNotifications()
      showStatus('Dismissed all notifications', 'success')
    } catch (err) {
      showStatus('Failed to dismiss all notifications', 'error')
    }
  }

  return {
    loggedIn,
    startPusher,
    loadNotifications,
    dismissNotification,
    dismissAllNotifications,
    companyChannel,
    userChannel,
  }
}
