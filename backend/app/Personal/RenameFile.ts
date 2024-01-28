import { Either } from 'App/types'
import PersonalFile from 'App/Models/PersonalFile'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFileHandler from 'App/Files/DuplicateFileHandler'

export default async function renameFile(
  fileId: number,
  name: string
): Promise<Either<PersonalFile>> {
  const file = await PersonalFile.query()
    .where('id', fileId)
    .preload('folder', (f) => f.select('id'))
    .first()

  if (file === null) {
    return { error: 'folder-does-not-exist' }
  }

  const duplicateHander = new DuplicateFileHandler('personal', file.personalFolderId, name)
  const nameToSave = await duplicateHander.handle()

  const renamedFile = await Database.transaction(async (trx) => {
    file.useTransaction(trx)
    file.name = nameToSave
    await file.save()

    if (!file.$isPersisted) {
      return false
    }

    return file
  })

  if (renamedFile === false) {
    return { error: 'could-not-create-file' }
  }

  return { error: null, success: renamedFile }
}
