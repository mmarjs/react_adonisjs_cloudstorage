import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getCompanyUserIdsByToken } from 'App/Lib/Helpers'
import PersonalFolder from 'App/Models/PersonalFolder'
import createFolder from 'App/Personal/CreateFolder'
import moveFolder from 'App/Personal/MoveFolder'
import renameFolder from 'App/Personal/RenameFolder'
import updateFolderStatus from 'App/Personal/UpdateFolderStatus'
import Sentry from 'App/Lib/Sentry'
import {
  CreatePersonalFolderBody,
  PersonalDirectoryParams,
  MovePersonalFolderBody,
  RenamePersonalFolderBody,
  UpdatePersonalFolderStatusBody,
} from 'App/types'
import {
  CreatePersonalFolderValidator,
  PersonalDirectoryValidator,
  MovePersonalFolderValidator,
  RenamePersonalFolderValidator,
  UpdatePersonalFolderStatusValidator,
} from 'App/Personal/Validators'

export default class PersonalFolderController {
  public async directory({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal Directory',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(PersonalDirectoryValidator)
    const params = request.all() as PersonalDirectoryParams

    const data = await PersonalFolder.getFolderChildren(params.folderId, [params.status])

    monitor.finish()
    return response.ok(data)
  }

  public async create({ request, response, token }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal Create Folder',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(CreatePersonalFolderValidator)
    const { companyId } = await getCompanyUserIdsByToken(token)
    const { userId, parentId, name } = request.all() as CreatePersonalFolderBody

    const { error, success } = await createFolder({ userId, parentId, name }, companyId)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok(success)
  }

  public async move({ request, response }: HttpContextContract) {
    await request.validate(MovePersonalFolderValidator)
    const { userId, folderId, newParentId } = request.all() as MovePersonalFolderBody

    const { error, success } = await moveFolder(userId, folderId, newParentId)

    if (error !== null) {
      return response.badRequest({ error: error })
    }

    return response.ok({ success })
  }

  public async rename({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal Rename Folder',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(RenamePersonalFolderValidator)
    const { folderId, name } = request.all() as RenamePersonalFolderBody

    const { error, success } = await renameFolder(folderId, name)

    if (error !== null) {
      return response.badRequest('folder could not be renamed')
    }

    monitor.finish()
    return response.ok({ success })
  }

  public async update({ request, response }: HttpContextContract) {
    const monitor = Sentry.startTransaction({
      op: 'transaction',
      name: 'Personal Update Folder',
    })
    Sentry.configureScope((scope) => {
      scope.setSpan(monitor)
    })

    await request.validate(UpdatePersonalFolderStatusValidator)
    const { userId, folderId, status } = request.all() as UpdatePersonalFolderStatusBody

    const { error, success } = await updateFolderStatus(userId, folderId, status)

    if (error !== null) {
      return response.badRequest({ error })
    }

    monitor.finish()
    return response.ok({ success })
  }
}
