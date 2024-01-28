import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('auth_status', 'AuthController.status').as('get_auth_status')
  Route.post('send_password_reset', 'AuthController.sendPasswordReset').as('send_password_reset')
  Route.post('reset_password', 'AuthController.resetPassword').as('reset_password')
  Route.post('/login', 'AuthController.login').as('login')
  Route.post('/share_login', 'AuthController.shareLogin').as('share_login')
  Route.post('/switch_company', 'AuthController.switchCompany').middleware(['auth'])
  Route.post('/authenticate_channel', 'AuthController.pusher').middleware(['auth'])
  Route.post('/logout', 'AuthController.logout').as('logout')
}).namespace('App/Auth')
