import PersonalFile from 'App/Models/PersonalFile'
import PersonalFolder from 'App/Models/PersonalFolder'
import Env from '@ioc:Adonis/Core/Env'
import { wasabiConfig } from 'App/Wasabi/WasabiConfig'
import { deleteObject } from 'App/Wasabi/Wasabi'
import { DeleteFolderResponse } from 'App/types'

/* Includes files in Wasabi */
export default async function deleteTrashedFolder(folderId: number): Promise<DeleteFolderResponse> {
  const env = Env.get('NODE_ENV')

  const folder = await PersonalFolder.query()
    .where('id', folderId)
    .where('status', 'trashed')
    .firstOrFail()

  const parentFolderName = folder.name

  const folders = await PersonalFolder.getFoldersIn(folder.userId, folder.id, ['trashed'])
  const folderIds = folders.map((f) => f.id)
  folderIds.unshift(folder.id)

  const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))

  const files = await PersonalFile.query()
    .select('id', 'personal_folder_id', 'path')
    .whereIn('personal_folder_id', folderIds)

  let deleted: number[] = []

  for (const file of files) {
    if (env !== 'testing') {
      const isWasabiFileDeleted = await deleteObject(config, file.path)

      if (isWasabiFileDeleted) {
        await file.delete()
        if (file.$isDeleted) {
          deleted.push(file.id)
        }
      }
    } else {
      await file.delete()
      if (file.$isDeleted) {
        deleted.push(file.id)
      }
    }
  }

  if (deleted.length === files.length) {
    await PersonalFolder.query().whereIn('id', folderIds).delete()
  }

  return { folderName: parentFolderName, fileIds: deleted }
}
