import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Case from 'App/Models/Case'
import Sentry from 'App/Lib/Sentry'
import Permission from 'App/Models/Permission'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import AssigendUsers from 'App/Case/AssignedUsers'
import CaseSearch from 'App/Case/CaseSearch'
import AllowableCases from 'App/Case/AllowableCases'
import Authorization from 'App/Auth/Authorization'
import ShowCase from 'App/Case/ShowCase'
import StoreCase from 'App/Case/StoreCase'
import UpdateCase from 'App/Case/UpdateCase'
import EventDispatcher from 'App/Event/EventDispatcher'
import PermissionMaker from 'App/Lib/PermissionMaker'
import {
  AddPermissionParams,
  UpdateCaseParams,
  CaseSearchParams,
  CreateCaseParams,
  CaseStatus,
} from 'App/types'
import {
  CasePermissionValidator,
  EditCaseValidator,
  CaseSearchValidator,
  AddCaseValidator,
} from 'App/Case/Validators'

export default class CaseController {
  /**
   * GET /cases
   */
  public async index({ response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Index',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const allowable = new AllowableCases(userId, companyId, 'read', ['active', 'archived'])
    const caseIds = await allowable.caseIds()

    const caseTotalFileSizes = await Case.fileSizeWithCaseId(caseIds)
    const assignedUserCount = await Permission.assignedUserCount(companyId)
    const cases = await Case.query().whereIn('id', caseIds).orderBy('case_name', 'asc').pojo()

    const result = {
      cases,
      caseTotalFileSizes,
      assignedUserCount,
    }

    monitor.finish()
    return response.ok(result)
  }

  /**
   * GET /cases/:id/show
   */
  public async show({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Show',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    const caseId = request.param('id') as number
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'read', 'case', caseId)
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'not-authorized' })
    }

    const showCase = new ShowCase(caseId)
    const result = await showCase.show()

    monitor.finish()
    return response.ok(result)
  }

  /**
   * GET /cases/:id/assigned_users
   */
  public async assignedUsers({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Assigned Users',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })
    const caseId = Number(request.param('id'))
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'grant', 'case', caseId)
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'not-authorized' })
    }

    const assignedUsers = new AssigendUsers(userId, companyId, caseId)
    const data = await assignedUsers.getData()

    monitor.finish()
    return response.ok(data)
  }

  /**
   * GET /cases/reqs
   */
  public async reqs({ response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Form Reqs',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    const showCase = new ShowCase(0)
    const result = await showCase.reqs()

    monitor.finish()
    return response.ok(result)
  }

  /**
   * POST /cases/store
   */
  public async store({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Store',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(AddCaseValidator)
    const params = request.all() as CreateCaseParams
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'create', 'case')
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'not-authorized' })
    }

    const store = new StoreCase(userId, companyId, params)
    const { error, success } = await store.store()

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }

  /**
   * POST /cases/search
   */
  public async search({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Search',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(CaseSearchValidator)
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const params = request.all() as CaseSearchParams

    try {
      const status: CaseStatus[] = params.showArchived ? ['active', 'archived'] : ['active']
      const allowedCases = new AllowableCases(userId, companyId, 'read', status)
      const caseIds = await allowedCases.caseIds()

      const search = new CaseSearch(caseIds, params)
      const cases = await search.search()

      monitor.finish()
      return response.ok(cases)
    } catch (err) {
      monitor.finish()
      response.badRequest({ error: 'failed-to-search' })
    }
  }

  /**
   * POST /cases/:id/add_user
   */
  public async addUser({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Add User',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(CasePermissionValidator)
    const caseId = Number(request.param('id'))
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const params = request.all() as AddPermissionParams

    const authorization = new Authorization(userId, companyId, 'grant', 'case', caseId)
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'not-authorized' })
    }

    const role = await Role.currentRole(params.userId, params.companyId)

    if (User.adminRoles.includes(role)) {
      return response.ok({ status: 'ok' })
    }

    if (role === 'case-manager') {
      await PermissionMaker.make(
        params.userId,
        companyId,
        params.resourceId,
        'case',
        Permission.actions
      )
    }

    if (role === 'client-user') {
      await PermissionMaker.make(params.userId, companyId, params.resourceId, 'case', [
        'read',
        'write',
      ])
    }

    await EventDispatcher.dispatch({
      userId,
      companyId,
      name: 'user-added-to-case',
      resource: 'case',
      resourceId: params.resourceId,
      data: { userId: params.userId, companyId: params.companyId },
    })

    monitor.finish()
    return response.ok({ status: 'ok' })
  }

  /**
   * PUT /cases/:id/update
   */
  public async update({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Update',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(EditCaseValidator)

    const caseId = Number(request.param('id'))
    const params = request.all() as UpdateCaseParams

    const { userId, companyId } = await getCompanyUserIdsByToken(request.header('token'))

    const authorization = new Authorization(userId, companyId, 'write', 'case', caseId)
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'not-authorized' })
    }

    const updateCase = new UpdateCase(caseId, params)
    const result = await updateCase.update()

    if (!result) {
      monitor.finish()
      return response.badRequest({ error: 'the case could not be saved' })
    }

    if (params.status === 'archive') {
      await EventDispatcher.dispatch({
        userId,
        companyId,
        name: 'case-archived',
        resource: 'case',
        resourceId: caseId,
      })
    }

    if (params.status === 'delete') {
      await EventDispatcher.dispatch({
        userId,
        companyId,
        name: 'case-deleted',
        resource: 'case',
        resourceId: caseId,
      })
    }

    monitor.finish()
    return response.ok({ message: 'the case was updated' })
  }

  /**
   * DELETE /cases/:id/remove_user
   */
  public async removeUser({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Case Store',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(CasePermissionValidator)
    const caseId = Number(request.param('id'))
    const params = request.all() as AddPermissionParams

    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'grant', 'case', caseId)
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      monitor.finish()
      return response.forbidden({ error: 'not-authorized' })
    }

    const res = await Permission.removePermission(
      params.userId,
      params.companyId,
      'case',
      params.resourceId
    )

    if (!res) {
      monitor.finish()
      return response.badRequest({ status: 'failed' })
    }

    await EventDispatcher.dispatch({
      userId,
      companyId,
      name: 'user-removed-from-case',
      resource: 'case',
      resourceId: caseId,
    })

    monitor.finish()
    return response.ok({ status: 'ok' })
  }
}
