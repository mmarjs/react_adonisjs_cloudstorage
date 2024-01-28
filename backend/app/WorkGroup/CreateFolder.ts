import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Authorization from 'App/Auth/Authorization'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'
import { Either, CreateWorkGroupFolderPipelineParams } from 'App/types'

export default async function createFolder(
  params: CreateWorkGroupFolderPipelineParams
): Promise<Either<WorkGroupFolder>> {
  const { caseId, parentId, ownerId, companyId, name } = params

  const authorization = new Authorization(ownerId, companyId, 'write', 'case', caseId)
  const isAuthorized = await authorization.isAuthorized()

  if (isAuthorized !== true) {
    return { error: 'user-has-no-write-permission' }
  }

  const duplicateHandler = new DuplicateFolderHandler('workgroup', caseId, parentId, name)
  const nameToSave = await duplicateHandler.handle()

  const user = await User.find(ownerId)

  if (!user) {
    return { error: 'no-user' }
  }

  const folder = await Database.transaction(async (trx) => {
    const folder = new WorkGroupFolder()
    folder.useTransaction(trx)
    folder.caseId = caseId
    folder.parentId = parentId
    folder.ownerId = user.id
    folder.name = nameToSave
    folder.status = 'active'
    folder.ownerName = `${user.firstName} ${user.lastName}`
    await folder.save()

    if (!folder.$isPersisted) {
      return false
    }

    return folder
  })

  if (!folder) {
    return { error: 'could-not-create-folder' }
  }

  return { error: null, success: folder }
}
