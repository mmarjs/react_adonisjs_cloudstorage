import { Either } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import PersonalFile from 'App/Models/PersonalFile'
import PersonalFolder from 'App/Models/PersonalFolder'

export default async function moveFile(
  fileIds: number[],
  nextFolderId: number
): Promise<Either<boolean>> {
  const folder = await PersonalFolder.query().where('id', nextFolderId).first()

  if (folder === null) {
    return { error: 'folder-does-not-exist' }
  }

  const res = await Database.transaction(async (trx) => {
    const nextFolder = await PersonalFolder.find(nextFolderId)

    if (nextFolder === null) {
      return false
    }

    const result = await PersonalFile.query({ client: trx })
      .whereIn('id', fileIds)
      .update({ personal_folder_id: nextFolderId })

    if (result.length === 0) {
      return false
    }

    return true
  })

  if (!res) {
    return { error: 'could-not-create-file' }
  }

  return { error: null, success: res }
}
