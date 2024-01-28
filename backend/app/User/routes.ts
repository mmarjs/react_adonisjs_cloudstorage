import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('register', 'UserController.registerAccount').as('register')
  Route.post('verify_account', 'UserController.verifyAccountOwner').as('verify_account_owner')
  Route.post('verify_user', 'UserController.verifyUser').as('verify_user_invitation')
}).namespace('App/User')

Route.group(() => {
  Route.get('/', 'UserController.index').as('users_index')
  Route.get(':id/show', 'UserController.show').as('show_user_screen')
  Route.get('reqs', 'UserController.reqs').as('new_user_screen')
  Route.post('invite', 'UserController.inviteUser').as('invite_user')
  Route.put(':id/update_account', 'UserController.updateAccount').as('update_account_user')
  Route.put(':id/update_profile', 'UserController.updateProfile').as('update_user')
})
  .prefix('users')
  .middleware(['auth'])
  .namespace('App/User')
