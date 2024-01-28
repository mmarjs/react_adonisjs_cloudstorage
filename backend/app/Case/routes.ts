import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'CaseController.index').as('cases_index')

  Route.get(':id/show', 'CaseController.show').as('show_single_case')

  Route.get(':id/assigned_users', 'CaseController.assignedUsers').as('show_assigned_users_of_case')

  Route.get('reqs', 'CaseController.reqs').as('case_form_reqs')

  Route.post('store', 'CaseController.store').as('store_case')

  Route.post('search', 'CaseController.search').as('case_search')

  Route.post(':id/add_user', 'CaseController.addUser').as('add_user_to_case')

  Route.put(':id/update', 'CaseController.update').as('update_case')

  Route.delete(':id/remove_user', 'CaseController.removeUser').as('remove_user_from_case')
})
  .middleware(['auth'])
  .prefix('cases')
  .namespace('App/Case')
