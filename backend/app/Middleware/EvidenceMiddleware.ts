import Log from 'App/Lib/Log'
import Role from 'App/Models/Role'
import { getCompanyUserByToken } from 'App/Lib/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EvidenceMiddleware {
  public async handle(
    { request, response, params }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      const token = request.header('token') || ''
      const { user, company } = await getCompanyUserByToken(token)

      const role = await Role.currentRole(user.id, company.id)

      if (role === 'evidence-user') {
        await user.load('permissions', (p) =>
          p.select('resource_id').where('resource', 'custodian').where('user_id', user.id)
        )
        const custodianIds = user.permissions.map((p) => p.resourceId)
        if (custodianIds.includes(params.id)) {
          return await next()
        } else {
          return response.badRequest({
            message: 'You do not have the correct role to access this resource',
          })
        }
      }

      return await next()
    } catch (err) {
      Log(err)
      return response.badRequest(err)
    }
  }
}
