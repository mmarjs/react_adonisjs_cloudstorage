import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PreferencesController.index')
  Route.put(':id/update', 'PreferencesController.update')
})
  .prefix('preferences')
  .middleware(['auth'])
  .namespace('App/Preference')
