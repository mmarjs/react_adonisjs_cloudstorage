import Route from '@ioc:Adonis/Core/Route'
import 'App/Admin/routes'
import 'App/Auth/routes'
import 'App/Case/routes'
import 'App/Company/routes'
import 'App/Dashboard/routes'
import 'App/Notification/routes'
import 'App/Files/routes'
import 'App/Personal/routes'
import 'App/Preference/routes'
import 'App/User/routes'
import 'App/Share/routes'
import 'App/WorkGroup/routes'
import 'App/WorkSpace/routes'

Route.get('/', async ({ response }) => {
  return response.ok({ message: 'Welcome to the Evidence Locker API' })
}).as('home')
