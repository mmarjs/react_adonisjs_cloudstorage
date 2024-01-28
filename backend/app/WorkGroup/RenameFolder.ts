import { Either } from 'App/types'
import AccessLog from 'App/Models/AccessLog'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Authorization from 'App/Auth/Authorization'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'

export default async function renameFolder(
  userId: number,
  folderId: number,
  name: string
): Promise<Either<true>> {
  const folder = await WorkGroupFolder.query()
    .select('id', 'parent_id', 'case_id')
    .where('id', folderId)
    .preload('case', (c) => c.select('company_id'))
    .first()

  if (folder === null) {
    return { error: 'folder-does-not-exist' }
  }

  const authorization = new Authorization(
    userId,
    folder.case.companyId,
    'write',
    'case',
    folder.caseId
  )
  const isAuthorized = await authorization.isAuthorized()

  if (!isAuthorized) {
    return { error: 'user-has-no-write-permission' }
  }

  const duplicateHandler = new DuplicateFolderHandler(
    'workgroup',
    folder.caseId,
    folder.parentId,
    name
  )
  const nameToSave = await duplicateHandler.handle()

  const res = await Database.transaction(async (trx) => {
    folder.useTransaction(trx)
    folder.name = nameToSave
    await folder.save()

    if (!folder.$isPersisted) {
      return false
    }

    return true
  })

  if (!res) {
    return { error: 'could-not-rename-folder' }
  }

  await AccessLog.create({
    userId,
    resourceId: folderId,
    resource: 'workgroup_folder',
    action: 'rename',
  })

  return { error: null, success: res }
}
