import { Either } from 'App/types'
import AccessLog from 'App/Models/AccessLog'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'
import { WorkGroupFolderStatus } from 'App/types'

/* Cascading Update */
export default async function updateFolderStatus(
  userId: number,
  caseId: number,
  folderId: number,
  status: WorkGroupFolderStatus
): Promise<Either<true>> {
  const folder = await WorkGroupFolder.find(folderId)

  if (folder === null) {
    return { error: 'no-workgroup-folder' }
  }

  const duplicateHandler = new DuplicateFolderHandler(
    'workgroup',
    caseId,
    folder?.parentId,
    folder?.name,
    status
  )
  const handledName = await duplicateHandler.handle()

  const childQuery = `WITH RECURSIVE work_group_tree (id, parent_id) AS (
    SELECT id, parent_id
    FROM work_group_folders
    WHERE case_id = ? AND parent_id = ?
    UNION ALL
    SELECT t.id, t.parent_id
    FROM work_group_tree AS tp
    JOIN work_group_folders AS t ON tp.id = t.parent_id
  )
  SELECT * FROM work_group_tree ORDER BY parent_id;`

  const childFoldersResult = await Database.rawQuery(childQuery, [caseId, folder.id])
  const childFolders = childFoldersResult[0] as any[]
  const folderIds = childFolders.map((child) => child.id) as number[]
  folderIds.unshift(folderId)

  const res = await Database.transaction(async (trx) => {
    const updatedFiles = await WorkGroupFile.query({ client: trx })
      .whereIn('work_group_folder_id', folderIds)
      .update({ status: status })

    if (updatedFiles.length === 0) {
      return false
    }

    if (folder.name !== handledName) {
      folder.name = handledName
      await folder.save()

      if (!folder.$isPersisted) {
        return false
      }
    }

    const updatedFolders = await WorkGroupFolder.query({ client: trx })
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

  await AccessLog.create({
    userId,
    resourceId: folderId,
    resource: 'workgroup_folder',
    action: 'update_status',
  })

  return { error: null, success: true }
}
