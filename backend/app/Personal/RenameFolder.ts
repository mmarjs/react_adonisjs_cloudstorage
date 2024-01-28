import { Either } from 'App/types'
import PersonalFolder from 'App/Models/PersonalFolder'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'
import Database from '@ioc:Adonis/Lucid/Database'

export default async function renameFolder(folderId: number, name: string): Promise<Either<true>> {
  const folder = await PersonalFolder.query()
    .select('id', 'parent_id', 'user_id')
    .where('id', folderId)
    .first()

  if (folder === null) {
    return { error: 'folder-does-not-exist' }
  }

  const duplicateHandler = new DuplicateFolderHandler(
    'personal',
    folder.userId,
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

  return { error: null, success: res }
}
