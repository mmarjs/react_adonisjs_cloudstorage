import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('switch', 'CompanyController.switch').as('switch_company')
  Route.put(':id/update', 'CompanyController.update').as('update_company')
})
  .prefix('company')
  .middleware(['auth'])
  .namespace('App/Company')
