import { DateTime } from 'luxon'
import Case from 'App/Models/Case'
import User from 'App/Models/User'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import FileTypeLookup from 'App/Files/FileTypeLookup'
import { Logger } from '@poppinss/cliui/build/src/Logger'
import Database from '@ioc:Adonis/Lucid/Database'

interface Folder {
  id: number
  case_id: number
  parent_id: number
  name: string
  files: File[]
}

interface File {
  name: string
  remote_path: string
  size: number
  status: 'active'
  date_created: string
  last_modified: string
  last_accessed: string
}

export async function initializeFolder(
  folder: Folder,
  user: User,
  caseInstance: Case,
  logger: Logger
) {
  const res = await Database.transaction(async (trx) => {
    const workGroupFolder = new WorkGroupFolder()
    workGroupFolder.useTransaction(trx)
    workGroupFolder.caseId = caseInstance.id
    workGroupFolder.ownerId = user.id
    workGroupFolder.name = folder.name
    workGroupFolder.access = 'private'
    workGroupFolder.status = 'pending'
    workGroupFolder.ownerName = user.fullName
    await workGroupFolder.save()

    if (!workGroupFolder.$isPersisted) {
      logger.error(`Failed to create pending folder: ${folder.name}`)
    } else {
      logger.debug(`Created pending folder ${folder.name}`)
    }

    for (let file of folder.files) {
      const lookup = new FileTypeLookup(file.name)
      const fileTypeId = await lookup.findType()

      const workFile = new WorkGroupFile()
      workFile.useTransaction(trx)
      workFile.workGroupFolderId = workGroupFolder.id
      workFile.fileTypeId = fileTypeId
      workFile.ownerId = user.id
      workFile.name = file.name
      workFile.path = file.remote_path
      workFile.size = file.size
      workFile.access = 'private'
      workFile.status = 'pending'
      workFile.ownerName = user.fullName
      workFile.lastAccessed = DateTime.fromJSDate(new Date(file.last_accessed))
      workFile.lastAccessedById = user.id
      workFile.lastModified = DateTime.fromJSDate(new Date(file.last_modified))
      workFile.dateCreated = DateTime.fromJSDate(new Date(file.date_created))
      await workFile.save()

      if (!workFile.$isPersisted) {
        logger.error(`Failed to create pending file: ${file.name}`)
      } else {
        logger.info(`Created pending file ${file.name}`)
      }
    }

    return workGroupFolder
  })

  return res
}

export async function finalizeFolder(
  folder: Folder,
  currentFolderId: number,
  parentId: number,
  logger: Logger
) {
  if (parentId === undefined) {
    console.log(`Cannot get parent id for ${folder.name}`)
    return false
  }

  const workGroupFolder = await WorkGroupFolder.find(currentFolderId)

  if (workGroupFolder === null) {
    return false
  }

  const res = await Database.transaction(async (trx) => {
    workGroupFolder.useTransaction(trx)
    workGroupFolder.status = 'active'
    workGroupFolder.parentId = parentId
    await workGroupFolder.save()

    if (!workGroupFolder.$isPersisted) {
      logger.error(`Could not activate ${folder.name}`)
    } else {
      logger.debug(`Activated pending folder ${folder.name}`)
    }

    const fileActivation = await WorkGroupFile.query({ client: trx })
      .where('work_group_folder_id', workGroupFolder.id)
      .update({ status: 'active' })

    logger.info(`Activated ${fileActivation[0]} files in ${folder.name}`)

    return workGroupFolder.$isPersisted
  })

  return res
}

export function findCurrentIds(
  folder: Folder,
  registry: Map<number, number>,
  rootFolderId: number
) {
  let parentId: number

  if (folder.parent_id === 0) {
    parentId = rootFolderId
  } else {
    parentId = registry.get(folder.parent_id) as number
  }

  const currentFolderId = registry.get(folder.id) as number

  return { currentFolderId, parentId }
}
