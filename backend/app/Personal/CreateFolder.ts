import User from 'App/Models/User'
import PersonalFolder from 'App/Models/PersonalFolder'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'
import { Either, CreatePersonalFolderPipelineParams } from 'App/types'

export default async function createFolder(
  params: CreatePersonalFolderPipelineParams,
  companyId: number
): Promise<Either<PersonalFolder>> {
  const { userId, parentId, name } = params

  const duplicateHandler = new DuplicateFolderHandler('personal', userId, parentId, name)
  const nameToSave = await duplicateHandler.handle()

  const user = await User.find(userId)

  if (!user) {
    return { error: 'no-user-given' }
  }

  const folder = new PersonalFolder()
  folder.userId = userId
  folder.parentId = parentId
  folder.companyId = companyId
  folder.name = nameToSave
  folder.status = 'active'
  await folder.save()

  if (!folder.$isPersisted) {
    return { error: 'could-not-create-folder' }
  }

  return { error: null, success: folder }
}
