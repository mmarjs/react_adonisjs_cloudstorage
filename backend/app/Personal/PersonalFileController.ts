import { allowableStatus } from 'App/Lib/Helpers'
import PersonalFolder from 'App/Models/PersonalFolder'
import PersonalFile from 'App/Models/PersonalFile'
import Sentry from 'App/Lib/Sentry'
import moveFile from 'App/Personal/MoveFile'
import renameFile from 'App/Personal/RenameFile'
import updateFileStatus from 'App/Personal/UpdateFileStatus'
import {
  MovePersonalFilesBody,
  RenamePersonalFileBody,
  UpdatePersonalFileStatusBody,
  PersonalFileStatus,
} from 'App/types'
import {
  MovePersonalFilesValidator,
  RenamePersonalFileValidator,
  UpdatePersonalFileStatusValidator,
} from 'App/Personal/Validators'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PersonalFileController {
  public async view({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal File View',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })
    const folderId = request.param('folder_id') as number
    const page = request.param('page') as number
    const limit = request.param('limit') as number
    const status = request.param('status') as PersonalFileStatus
    const folder = await PersonalFolder.find(folderId)

    if (folder === null) {
      return response.unprocessableEntity({ error: 'invalid-folder-id' })
    }

    if (!allowableStatus.includes(status)) {
      return response.unprocessableEntity({ error: 'invalid-status' })
    }

    const files = await PersonalFile.getFilesIn(folder.id, [status], page, limit)

    monitor.finish()
    return response.ok(files)
  }

  public async move({ request, response }: HttpContextContract) {
    await request.validate(MovePersonalFilesValidator)
    const { fileIds, nextFolderId } = request.all() as MovePersonalFilesBody

    const { error, success } = await moveFile(fileIds, nextFolderId)

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ success })
  }

  public async rename({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal File Rename',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })
    await request.validate(RenamePersonalFileValidator)

    const { fileId, name } = request.all() as RenamePersonalFileBody

    const { error, success } = await renameFile(fileId, name)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }

  public async update({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal File Update',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })
    await request.validate(UpdatePersonalFileStatusValidator)
    const { fileIds, status } = request.all() as UpdatePersonalFileStatusBody

    const { error, success } = await updateFileStatus(fileIds, status)

    if (error !== null) {
      console.log(error)
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }
}
