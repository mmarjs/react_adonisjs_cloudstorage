import Role from 'App/Models/Role'
import Company from 'App/Models/Company'
import Sentry from 'App/Lib/Sentry'
import UpdateCompany from 'App/Company/UpdateCompany'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { UpdateCompanyBody } from 'App/types'

export default class CompanyController {
  /**
   * GET /company/switch_screen
   */
  public async switch({ response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Switch Company Screen',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    const { userId } = await getCompanyUserIdsByToken(token)

    const companyIds = await Role.companies(userId)

    const companies = await Company.query()
      .select('id', 'name')
      .whereIn('id', companyIds)
      .pojo<{ id: number; name: string }>()

    monitor.finish()
    return response.ok(companies)
  }

  /**
   * PUT /company/:id/update
   */
  public async update({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Company Update',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })
    const companyId = Number(request.param('id'))
    const data = request.all() as UpdateCompanyBody

    const update = new UpdateCompany(companyId, data)
    const result = await update.update()

    if (!result) {
      return response.badRequest({ error: 'could not update the company' })
    }

    monitor.finish()
    return response.ok(result)
  }
}
