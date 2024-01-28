import { Either } from 'App/types'
import AccessLog from 'App/Models/AccessLog'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import { WorkGroupFileStatus } from 'App/types'
import Authorization from 'App/Auth/Authorization'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFileHandler from 'App/Files/DuplicateFileHandler'

export default async function updateFileStatus(
  userId: number,
  companyId: number,
  caseId: number,
  fileIds: number[],
  status: WorkGroupFileStatus
): Promise<Either<true>> {
  const authorization = new Authorization(userId, companyId, 'write', 'case', caseId)
  const isAuthorized = await authorization.isAuthorized()

  if (!isAuthorized) {
    return { error: 'user-has-no-write-permission' }
  }

  let failed = 0

  for (let fileId of fileIds) {
    const file = await WorkGroupFile.query()
      .select('id', 'work_group_folder_id', 'name', 'status')
      .where('id', fileId)
      .first()

    if (file === null) {
      failed = failed + 1
      continue
    }

    const duplicateHandler = new DuplicateFileHandler(
      'workgroup',
      file.workGroupFolderId,
      file.name,
      status
    )
    const nameToSave = await duplicateHandler.handle()

    const res = await Database.transaction(async (trx) => {
      file.useTransaction(trx)
      file.status = status
      file.name = nameToSave

      await file.save()

      return file.$isPersisted
    })

    if (!res) {
      failed = failed + 1
    }
  }

  if (failed > 0) {
    return { error: 'files could not be updated in the folder' }
  }

  await AccessLog.create({
    userId,
    resourceId: caseId,
    resource: 'workgroup_file',
    action: 'update_status',
  })

  return { error: null, success: true }
}
