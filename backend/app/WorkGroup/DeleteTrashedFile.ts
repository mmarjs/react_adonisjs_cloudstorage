import WorkGroupFile from 'App/Models/WorkGroupFile'
import { deleteObject } from 'App/Wasabi/Wasabi'
import { wasabiConfig } from 'App/Wasabi/WasabiConfig'
import Env from '@ioc:Adonis/Core/Env'

export default async function deleteTrashedFile(fileId: number): Promise<boolean> {
  const file = await WorkGroupFile.query().where('id', fileId).where('status', 'trashed').first()

  if (file === null) {
    return false
  }

  await file.delete()

  if (Env.get('NODE_ENV') !== 'testing') {
    const config = wasabiConfig(Env.get('WASABI_WORKSPACE_BUCKET'))
    const res = await deleteObject(config, file.path)

    if (!res) {
      throw new Error('Failed to Delete WorkGroup File')
    }
  }

  return file.$isDeleted
}
