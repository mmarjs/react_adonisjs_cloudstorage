import directory from 'App/WorkSpace/Directory'
import recycleBin from 'App/WorkSpace/RecycleBin'
import WorkSpaceSearch from 'App/WorkSpace/WorkSpaceSearch'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { WorkSpaceSearchValidator } from 'App/WorkSpace/Validators'
import { WorkSpaceSearchBody } from 'App/types'

export default class WorkSpaceController {
  public async directory({ request, response, token }: HttpContextContract) {
    const caseId = request.param('case_id') as number
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const { error, success } = await directory(userId, companyId, caseId)

    if (error !== null) {
      return response.forbidden({ error })
    }

    return response.ok(success)
  }

  public async recycleBin({ request, response, token }: HttpContextContract) {
    const caseId = request.param('case_id') as number
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const { error, success } = await recycleBin(userId, companyId, caseId)

    if (error !== null) {
      return response.forbidden({ error })
    }

    return response.ok(success)
  }

  public async search({ request, response, token }: HttpContextContract) {
    await request.validate(WorkSpaceSearchValidator)
    const { companyId } = await getCompanyUserIdsByToken(token)

    try {
      const body = request.all() as WorkSpaceSearchBody
      const search = new WorkSpaceSearch(body, companyId)
      const results = await search.search()

      if (results === null) {
        return response.badRequest('Invalid search query')
      }

      return response.ok(results)
    } catch (err) {
      return response.badRequest()
    }
  }
}
