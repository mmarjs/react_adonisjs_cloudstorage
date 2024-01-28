import { Either } from 'App/types'
import { PersonalFolderStatus } from 'App/types'
import PersonalFile from 'App/Models/PersonalFile'
import PersonalFolder from 'App/Models/PersonalFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'

/* Cascading Update */
export default async function updateFolderStatus(
  userId: number,
  folderId: number,
  status: PersonalFolderStatus
): Promise<Either<true>> {
  const folder = await PersonalFolder.find(folderId)

  if (folder === null) {
    return { error: 'no-folder' }
  }

  const duplicateHandler = new DuplicateFolderHandler(
    'personal',
    userId,
    folder.parentId,
    folder.name,
    status
  )
  const handledName = await duplicateHandler.handle()

  const res = await Database.transaction(async (trx) => {
    const childQuery = `WITH RECURSIVE personal_tree (id, parent_id) AS (
        SELECT id, parent_id
        FROM personal_folders
        WHERE user_id = ? AND parent_id = ?
        UNION ALL
        SELECT t.id, t.parent_id
        FROM personal_tree AS tp
        JOIN personal_folders AS t ON tp.id = t.parent_id
      )
      SELECT * FROM personal_tree ORDER BY parent_id;`

    const childFoldersResult = await Database.rawQuery(childQuery, [userId, folder.id])
    const childFolders = childFoldersResult[0] as any[]
    const folderIds = childFolders.map((child) => child.id) as number[]
    folderIds.unshift(folderId)

    if (folder.name !== handledName) {
      folder.name = handledName
      await folder.save()

      if (!folder.$isPersisted) {
        return false
      }
    }

    const updatedFiles = await PersonalFile.query({ client: trx })
      .whereIn('personal_folder_id', folderIds)
      .update({ status: status })

    if (updatedFiles.length === 0) {
      return false
    }

    const updatedFolders = await PersonalFolder.query({ client: trx })
      .whereIn('id', folderIds)
      .update({ status: status })

    if (updatedFolders.length === 0) {
      return false
    }

    return true
  })

  if (!res) {
    return { error: 'could-not-update-folder-status' }
  }

  return { error: null, success: res }
}
