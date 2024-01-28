function askForNotificationPermission() {
  const status = localStorage.getItem('notification_permission')
  if (status === null) {
    if (Notification.permission !== 'denied' || 'default') {
      Notification.requestPermission(function (permission) {
        localStorage.setItem('notification_permission', permission)
      })
    }
  }
}

function hasBrowserNotificationPermission(): boolean {
  return Notification.permission === 'granted'
}

function sendNotification(title: string, body: string) {
  new Notification(title, { body })
}

export { askForNotificationPermission, hasBrowserNotificationPermission, sendNotification }
