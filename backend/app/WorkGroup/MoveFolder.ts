import AccessLog from 'App/Models/AccessLog'
import { Either } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import Authorization from 'App/Auth/Authorization'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'

export default async function moveFolder(
  caseId: number,
  folderId: number,
  newParentId: number,
  userId: number,
  companyId: number
): Promise<Either<true>> {
  const authorization = new Authorization(userId, companyId, 'write', 'case', caseId)
  const isAuthorized = await authorization.isAuthorized()

  if (!isAuthorized) {
    return { error: 'user-has-no-write-permission' }
  }

  const folder = await WorkGroupFolder.query()
    .select('name', 'case_id', 'parent_id')
    .where('id', folderId)
    .first()

  if (folder === null) {
    return { error: 'folder-does-not-exist' }
  }

  const duplicateHandler = new DuplicateFolderHandler(
    'workgroup',
    folder.caseId,
    folder.parentId,
    folder.name
  )
  const nameToSave = await duplicateHandler.handle()

  const res = await Database.transaction(async (trx) => {
    const folder = await WorkGroupFolder.find(folderId)
    const newParent = await WorkGroupFolder.find(newParentId)

    if (folder === null || newParent === null) {
      return false
    }

    if (await WorkGroupFolder.isChildFolder(caseId, folder.id, newParent.id)) {
      return false
    }

    folder.useTransaction(trx)
    folder.parentId = newParentId
    folder.name = nameToSave

    await folder.save()

    if (!folder.$isPersisted) {
      return false
    }

    return true
  })

  if (!res) {
    return { error: 'could-not-move-folder' }
  }

  await AccessLog.create({
    userId,
    resourceId: caseId,
    resource: 'case',
    action: 'write',
  })

  return { error: null, success: true }
}
