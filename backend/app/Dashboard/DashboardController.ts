import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import Dashboard from 'App/Dashboard/Dashboard'
import Sentry from 'App/Lib/Sentry'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DashboardController {
  public async index({ response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Dashboard Screen',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    try {
      const { userId, companyId } = await getCompanyUserIdsByToken(token)
      const dashboard = new Dashboard(userId, companyId)
      const data = await dashboard.getData()

      monitor.finish()
      return response.ok(data)
    } catch (err) {
      Sentry.captureException(err)
      monitor.finish()
      return response.badRequest({ error: 'Dashboard Index Failure' })
    }
  }

  public test({ response }: HttpContextContract) {
    return response.json({ message: 'You are logged in' })
  }
}
