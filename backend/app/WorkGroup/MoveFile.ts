import { Either } from 'App/types'
import Authorization from 'App/Auth/Authorization'
import Database from '@ioc:Adonis/Lucid/Database'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'

export default async function moveFile(
  userId: number,
  fileIds: number[],
  nextFolderId: number
): Promise<Either<boolean>> {
  const folder = await WorkGroupFolder.query()
    .where('id', nextFolderId)
    .preload('case', (c) => c.select('id', 'company_id'))
    .first()

  if (folder === null) {
    return { error: 'folder-does-not-exist' }
  }

  const companyId = folder.case.companyId

  const authorization = new Authorization(userId, companyId, 'write', 'case', folder.case.id)
  const isAuthorized = await authorization.isAuthorized()

  if (!isAuthorized) {
    return { error: 'user-has-no-write-permission' }
  }

  const res = await Database.transaction(async (trx) => {
    const nextFolder = await WorkGroupFolder.find(nextFolderId)

    if (nextFolder === null) {
      return false
    }

    const result = await WorkGroupFile.query({ client: trx })
      .whereIn('id', fileIds)
      .update({ work_group_folder_id: nextFolderId })

    if (result.length === 0) {
      return false
    }

    return true
  })

  if (res === false) {
    return { error: 'could-not-move-file' }
  }

  return { error: null, success: res }
}
