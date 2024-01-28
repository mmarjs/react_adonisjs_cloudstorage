import PersonalFile from 'App/Models/PersonalFile'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFileHandler from 'App/Files/DuplicateFileHandler'
import { PersonalFileStatus, Either } from 'App/types'

export default async function updateFileStatus(
  fileIds: number[],
  status: PersonalFileStatus
): Promise<Either<true>> {
  let failed = 0

  for (let fileId of fileIds) {
    const file = await PersonalFile.query()
      .select('id', 'personal_folder_id', 'name', 'status')
      .where('id', fileId)
      .first()

    if (file === null) {
      failed = failed + 1
      continue
    }

    const duplicateHandler = new DuplicateFileHandler(
      'personal',
      file.personalFolderId,
      file.name,
      status
    )
    const handledName = await duplicateHandler.handle()

    const res = await Database.transaction(async (trx) => {
      file.useTransaction(trx)
      file.status = status

      if (file.name !== handledName) {
        file.name = handledName
      }

      await file.save()

      return file.$isPersisted
    })

    if (!res) {
      failed = failed + 1
    }
  }

  if (failed > 0) {
    return { error: 'files could not be updated' }
  }

  return { error: null, success: true }
}
