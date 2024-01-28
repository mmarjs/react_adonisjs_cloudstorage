import { Either } from 'App/types'
import AccessLog from 'App/Models/AccessLog'
import Authorization from 'App/Auth/Authorization'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFileHandler from 'App/Files/DuplicateFileHandler'

export default async function renameFile(
  userId: number,
  companyId: number,
  fileId: number,
  name: string
): Promise<Either<WorkGroupFile>> {
  const file = await WorkGroupFile.query()
    .where('id', fileId)
    .preload('folder', (f) => f.select('id', 'case_id'))
    .first()

  if (file === null) {
    return { error: 'folder-does-not-exist' }
  }

  const authorization = new Authorization(userId, companyId, 'write', 'case', file.folder.caseId)
  const isAuthorized = await authorization.isAuthorized()

  if (!isAuthorized) {
    return { error: 'user-has-no-write-permission' }
  }

  const duplicateHander = new DuplicateFileHandler('workgroup', file.workGroupFolderId, name)
  const nameToSave = await duplicateHander.handle()

  const res = await Database.transaction(async (trx) => {
    file.useTransaction(trx)
    file.name = nameToSave
    await file.save()

    if (!file.$isPersisted) {
      return false
    }

    return file
  })

  if (!res) {
    return { error: 'could-not-create-file' }
  }

  await AccessLog.create({
    userId,
    resource: 'workgroup_file',
    resourceId: fileId,
    action: 'rename',
  })

  return { error: null, success: res }
}
