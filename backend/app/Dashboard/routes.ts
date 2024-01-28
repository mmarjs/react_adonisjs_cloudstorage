import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/dashboard', 'DashboardController.index').as('dashboard_screen')

  if (process.env.NODE_ENV !== 'production') {
    Route.get('test_screen', 'DashboardController.test')
  }
})
  .middleware(['auth'])
  .namespace('App/Dashboard')
