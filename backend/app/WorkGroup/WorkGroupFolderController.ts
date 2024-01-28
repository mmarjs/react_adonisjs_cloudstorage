import Sentry from 'App/Lib/Sentry'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import createFolder from 'App/WorkGroup/CreateFolder'
import moveFolder from 'App/WorkGroup/MoveFolder'
import renameFolder from 'App/WorkGroup/RenameFolder'
import updateFolderStatus from 'App/WorkGroup/UpdateFolderStatus'
import {
  CreateWorkGroupFolderValidator,
  WorkGroupDirectoryValidator,
  MoveWorkGroupFolderValidator,
  UpdateWorkGroupFolderStatusValidator,
  RenameWorkGroupFolderValidator,
} from 'App/WorkGroup/Validators'
import {
  CreateWorkGroupFolderBody,
  WorkGroupDirectoryParams,
  MoveWorkGroupFolderBody,
  UpdateWorkGroupFolderStatusBody,
  RenameWorkGroupFolderBody,
} from 'App/types'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class WorkGroupFolderController {
  public async directory({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgroup Directory',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(WorkGroupDirectoryValidator)
    const params = request.all() as WorkGroupDirectoryParams

    const data = await WorkGroupFolder.getFolderChildren(params.folderId, [params.status])

    monitor.finish()
    return response.ok(data)
  }

  public async create({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgroup Create Folder',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(CreateWorkGroupFolderValidator)

    const { caseId, parentId, name } = request.all() as CreateWorkGroupFolderBody
    const { userId: ownerId, companyId } = await getCompanyUserIdsByToken(token)

    const { error, success } = await createFolder({ caseId, parentId, ownerId, companyId, name })

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok(success)
  }

  public async move({ request, response, token }: HttpContextContract) {
    await request.validate(MoveWorkGroupFolderValidator)
    const { caseId, folderId, newParentId } = request.all() as MoveWorkGroupFolderBody
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const { error, success } = await moveFolder(caseId, folderId, newParentId, userId, companyId)

    if (error !== null) {
      return response.badRequest({ error: error })
    }

    return response.ok({ success })
  }

  public async rename({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgroup Rename Folder',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(RenameWorkGroupFolderValidator)

    const { userId } = await getCompanyUserIdsByToken(token)
    const { folderId, name } = request.all() as RenameWorkGroupFolderBody
    const { error, success } = await renameFolder(userId, folderId, name)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }

  public async update({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgroup Update Folder',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })
    await request.validate(UpdateWorkGroupFolderStatusValidator)

    const { userId } = await getCompanyUserIdsByToken(token)
    const { caseId, folderId, status } = request.all() as UpdateWorkGroupFolderStatusBody
    const { error, success } = await updateFolderStatus(userId, caseId, folderId, status)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }
}
