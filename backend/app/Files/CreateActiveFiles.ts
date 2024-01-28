import User from 'App/Models/User'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import PersonalFile from 'App/Models/PersonalFile'
import Database from '@ioc:Adonis/Lucid/Database'
import FileTypeLookup from 'App/Files/FileTypeLookup'
import DuplicateFileHandler from 'App/Files/DuplicateFileHandler'

/** Helpers */
import { produce } from 'immer'
import { DateTime } from 'luxon'
import { Either, ActiveFileParams, CreateActiveFileParams } from 'App/types'

export default class CreateActiveFiles {
  public activeFileParams: ActiveFileParams
  public userId: number

  constructor(userId: number, activeFileParams: ActiveFileParams) {
    this.userId = userId
    this.activeFileParams = activeFileParams
  }

  public async create(): Promise<Either<boolean>> {
    const { files } = this.activeFileParams

    let failures: string[] = []

    for (const file of files) {
      const lookup = new FileTypeLookup(file.filename)
      const fileTypeId = await lookup.findType()

      const params: CreateActiveFileParams = {
        resource: file.resource,
        folder_id: file.folder_id,
        filename: file.filename,
        size: file.size,
        path: file.path,
        last_modified: file.last_modified,
        userId: this.userId,
        fileTypeId: fileTypeId,
      }

      if (file.resource === 'workgroup') {
        const duplicateHandler = new DuplicateFileHandler(
          'workgroup',
          params.folder_id,
          params.filename
        )
        const nameToSave = await duplicateHandler.handle()

        const nextParams = produce(params, (draft) => {
          draft.filename = nameToSave
        })

        const res = await this.createWorkGroupFile(nextParams)

        if (!res) {
          failures.push(file.filename)
        }
      }

      if (file.resource === 'personal') {
        const duplicateHandler = new DuplicateFileHandler(
          'personal',
          params.folder_id,
          params.filename
        )
        const nameToSave = await duplicateHandler.handle()

        const nextParams = produce(params, (draft) => {
          draft.filename = nameToSave
        })

        const res = await this.createPersonalFile(nextParams)

        if (!res) {
          failures.push(file.filename)
        }
      }
    }

    if (failures.length > 0) {
      return { error: failures.join(',') }
    }

    return { error: null, success: true }
  }

  public async createWorkGroupFile(params: CreateActiveFileParams) {
    const user = await User.query()
      .select('id', 'first_name', 'last_name')
      .where('id', params.userId)
      .first()

    if (!user) {
      return false
    }

    const date: DateTime = DateTime.fromISO(params.last_modified)

    return await Database.transaction(async (trx) => {
      try {
        const file = new WorkGroupFile()
        file.useTransaction(trx)
        file.workGroupFolderId = params.folder_id
        file.fileTypeId = params.fileTypeId
        file.ownerId = user.id
        file.name = params.filename
        file.path = params.path
        file.size = params.size
        file.access = 'private'
        file.status = 'active'
        file.ownerName = user.fullName
        file.dateCreated = date
        file.lastAccessed = date
        file.lastModified = date
        file.lastAccessedById = user.id
        await file.save()

        if (!file.$isPersisted) {
          return false
        }

        return true
      } catch (err) {
        return false
      }
    })
  }

  public async createPersonalFile(params: CreateActiveFileParams) {
    return await Database.transaction(async (trx) => {
      const date: DateTime = DateTime.fromISO(params.last_modified)

      try {
        const file = new PersonalFile()
        file.useTransaction(trx)
        file.personalFolderId = params.folder_id
        file.fileTypeId = params.fileTypeId
        file.name = params.filename
        file.path = params.path
        file.size = params.size
        file.access = 'private'
        file.status = 'active'
        file.dateCreated = date
        file.lastAccessed = date
        file.lastModified = date
        await file.save()

        if (!file.$isPersisted) {
          return false
        }

        return true
      } catch (err) {
        return false
      }
    })
  }
}
