import Sentry from 'App/Lib/Sentry'
import moveFile from 'App/WorkGroup/MoveFile'
import renameFile from 'App/WorkGroup/RenameFile'
import updateFileStatus from 'App/WorkGroup/UpdateFileStatus'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Authorization from 'App/Auth/Authorization'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { allowableStatus, getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import {
  UpdateWorkGroupFileStatusValidator,
  MoveWorkGroupFilesValidator,
  RenameWorkGroupFileValidator,
} from 'App/WorkGroup/Validators'
import {
  UpdateWorkGroupFileStatusBody,
  MoveWorkGroupFilesBody,
  RenameWorkGroupFileBody,
  WorkGroupFileStatus,
} from 'App/types'

export default class WorkGroupFileController {
  public async view({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgroup File View',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    const folderId = request.param('folder_id') as number
    const page = request.param('page') as number
    const limit = request.param('limit') as number
    const status = request.param('status') as WorkGroupFileStatus
    const folder = await WorkGroupFolder.find(folderId)

    if (folder === null) {
      return response.unprocessableEntity({ error: 'invalid-folder-id' })
    }

    if (!allowableStatus.includes(status)) {
      return response.unprocessableEntity({ error: 'invalid-status' })
    }

    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'read', 'case', folder.caseId)
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return { error: 'user-has-no-read-permission' }
    }

    const files = await WorkGroupFile.getFilesIn(folder.id, [status], page, limit)

    monitor.finish()
    return response.ok(files)
  }

  public async move({ request, response, token }: HttpContextContract) {
    await request.validate(MoveWorkGroupFilesValidator)

    const { userId } = await getCompanyUserIdsByToken(token)
    const { fileIds, nextFolderId } = request.all() as MoveWorkGroupFilesBody
    const { error, success } = await moveFile(userId, fileIds, nextFolderId)

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ success })
  }

  public async rename({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgrop File Rename',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(RenameWorkGroupFileValidator)

    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const { fileId, name } = request.all() as RenameWorkGroupFileBody

    const { error, success } = await renameFile(userId, companyId, fileId, name)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }

  public async update({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Workgroup File Update',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(UpdateWorkGroupFileStatusValidator)

    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const { caseId, fileIds, status } = request.all() as UpdateWorkGroupFileStatusBody

    const { error, success } = await updateFileStatus(userId, companyId, caseId, fileIds, status)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }
}
