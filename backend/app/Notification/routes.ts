import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'NotificationController.index')
  Route.get('/count', 'NotificationController.count')
  Route.put('/:id/dismiss', 'NotificationController.dismiss')
  Route.put('/dismiss_all', 'NotificationController.dismissAll')
})
  .prefix('notifications')
  .middleware(['auth'])
  .namespace('App/Notification')

Route.group(() => {
  Route.get('/', 'NotificationSettingController.index')
  Route.put(':id/update', 'NotificationSettingController.update')
})
  .prefix('notification_settings')
  .middleware(['auth'])
  .namespace('App/Notification')
