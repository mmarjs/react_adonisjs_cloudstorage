import Log from 'App/Lib/Log'
import Role from 'App/Models/Role'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      const token = request.header('token')
      const { userId, companyId } = await getCompanyUserIdsByToken(token)
      const role = await Role.currentRole(userId, companyId)

      if (role === 'account-owner' || role === 'account-admin') {
        return await next()
      } else {
        return response.badRequest({
          message: 'You do not have the correct role to access this resource',
        })
      }
    } catch (err) {
      Log(err)
      return response.badRequest(err)
    }
  }
}
