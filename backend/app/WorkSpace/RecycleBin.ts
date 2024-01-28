import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import PersonalFolder from 'App/Models/PersonalFolder'
import PersonalFile from 'App/Models/PersonalFile'
import { Either } from 'App/types'

export default async function recycleBin(
  userId: number,
  companyId: number,
  caseId: number
): Promise<Either<object>> {
  const trashedWorkGroupFolders = await WorkGroupFolder.getFolders(caseId, ['trashed'])
  const trashedWorkGroupFolderIds = trashedWorkGroupFolders.map((folder) => folder.id)
  const trashedFolderWorkGroupFiles = await WorkGroupFile.getFiles(trashedWorkGroupFolderIds, [
    'trashed',
  ])
  const activeWorkgroupFolderFiles = await WorkGroupFile.getTrashedFilesByActiveFolder(caseId)

  const trashedPersonalFolders = await PersonalFolder.getFolders(userId, companyId, ['trashed'])
  const trashedPersonalFolderIds = trashedPersonalFolders.map((folder) => folder.id)
  const trashedFolderPersonalFiles = await PersonalFile.getFiles(trashedPersonalFolderIds, [
    'trashed',
  ])

  const activePersonalFolderFiles = await PersonalFile.getTrashedFilesByActiveFolder(
    userId,
    companyId
  )

  return {
    error: null,
    success: {
      workGroupData: {
        folders: trashedWorkGroupFolders,
        trashedFolderfiles: trashedFolderWorkGroupFiles,
        activeFolderFiles: activeWorkgroupFolderFiles,
      },
      personalData: {
        folders: trashedPersonalFolders,
        trashedFolderfiles: trashedFolderPersonalFiles,
        activeFolderFiles: activePersonalFolderFiles,
      },
    },
  }
}
