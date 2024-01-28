import { Either } from 'App/types'
import PersonalFolder from 'App/Models/PersonalFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'

export default async function moveFolder(
  userId: number,
  folderId: number,
  newParentId: number
): Promise<Either<true>> {
  const folder = await PersonalFolder.query()
    .select('id', 'name', 'user_id', 'parent_id', 'name')
    .where('id', folderId)
    .first()

  const newParent = await PersonalFolder.find(newParentId)

  if (folder === null || newParent === null) {
    return { error: 'folder-does-not-exist' }
  }

  const isChild = await PersonalFolder.isChildFolder(userId, folder.id, newParent.id)

  if (isChild) {
    return { error: 'cannot-move-folder-into-child-folder' }
  }

  const duplicateHandler = new DuplicateFolderHandler(
    'personal',
    folder.userId,
    folder.parentId,
    folder.name
  )
  const nameToSave = await duplicateHandler.handle()

  const res = await Database.transaction(async (trx) => {
    folder.useTransaction(trx)
    folder.parentId = newParent.id
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

  return { error: null, success: res }
}
