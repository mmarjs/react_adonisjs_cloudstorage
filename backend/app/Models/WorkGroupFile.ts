import { DateTime } from 'luxon'
import User from 'App/Models/User'
import FileType from 'App/Models/FileType'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import { WorkGroupFileItem, WorkGroupFileStatus } from 'App/types'
import { flatten } from 'lodash'
import { BaseModel, column, belongsTo, BelongsTo, scope } from '@ioc:Adonis/Lucid/Orm'

export default class WorkGroupFile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public workGroupFolderId: number

  @column()
  public fileTypeId: number

  @column()
  public ownerId: number

  @column()
  public name: string

  @column()
  public path: string

  @column()
  public size: number

  @column()
  public access: 'private' | 'shared'

  @column()
  public status: WorkGroupFileStatus

  @column()
  public ownerName: string

  @column()
  public notes: string

  @column.dateTime()
  public dateCreated: DateTime

  @column.dateTime()
  public lastModified: DateTime

  @column.dateTime()
  public lastAccessed: DateTime

  @column()
  public lastAccessedById: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => WorkGroupFolder)
  public folder: BelongsTo<typeof WorkGroupFolder>

  @belongsTo(() => FileType)
  public fileType: BelongsTo<typeof FileType>

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
    localKey: 'id',
  })
  public owner: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'lastAccessedById',
    localKey: 'id',
  })
  public lastAccessedBy: BelongsTo<typeof User>

  public static byFolderAndName = scope(
    (query, folderId: number, name: string, status?: WorkGroupFileStatus) => {
      query.where('work_group_folder_id', folderId).where('name', name)

      if (status) {
        query.where('status', status)
      }
    }
  )

  public static async getCaseId(fileId: number): Promise<number | null> {
    const file = await WorkGroupFile.query()
      .select('work_group_folders.case_id')
      .join('work_group_folders', 'work_group_files.work_group_folder_id', 'work_group_folders.id')
      .where('work_group_files.id', fileId)
      .pojo<{ case_id: number }>()
      .first()

    return file?.case_id ?? null
  }

  public static async getFiles(
    folderIds: number[],
    status: WorkGroupFileStatus[]
  ): Promise<WorkGroupFileItem[]> {
    const files = await WorkGroupFile.query()
      .whereIn('status', status)
      .whereIn('work_group_folder_id', folderIds)
      .orderBy('work_group_folder_id', 'asc')
      .orderBy('name', 'asc')
      .preload('fileType', (f) => f.select(['name']))

    return files.map((file) => file.serialize() as WorkGroupFileItem)
  }

  public static async getFilesIn(
    folderId: number,
    status: WorkGroupFileStatus[],
    page: number,
    limit: number
  ): Promise<WorkGroupFileItem[]> {
    const files = await Database.query()
      .select('file.*', 'fileType.name as file_type_name')
      .from('work_group_files as file')
      .leftJoin('file_types as fileType', 'file.file_type_id', 'fileType.id')
      .whereIn('status', status)
      .where('work_group_folder_id', folderId)
      .orderBy('name', 'asc')
      .paginate(page, limit)
    return files as WorkGroupFileItem[]
  }

  public static async getFilesIdsInFolder(
    folderId: number,
    status: WorkGroupFileStatus[]
  ): Promise<number[]> {
    const files = await WorkGroupFile.query()
      .select('id')
      .where('work_group_folder_id', folderId)
      .where('status', status)

    return files.map((f) => f.id)
  }

  public static async getSelectedFiles(
    fileIds: number[],
    status: WorkGroupFileStatus[]
  ): Promise<WorkGroupFileItem[]> {
    const files = await WorkGroupFile.query()
      .whereIn('id', fileIds)
      .whereIn('status', status)
      .orderBy('work_group_folder_id', 'asc')
      .orderBy('name', 'asc')
      .preload('fileType', (f) => f.select(['name']))

    return files.map((file) => file.serialize() as WorkGroupFileItem)
  }

  public static async getFilesInSelectedFolders(
    folderIds: number[],
    status: WorkGroupFileStatus[]
  ): Promise<WorkGroupFileItem[]> {
    let files: WorkGroupFileItem[][] = []

    for (let folderId of folderIds) {
      let someFiles = await WorkGroupFile.getFilesIn(folderId, status, 1, 10)
      files.push(someFiles)
    }

    return flatten(files)
  }

  public static async getTrashedFilesByActiveFolder(caseId: number): Promise<WorkGroupFileItem[]> {
    const files = await Database.query()
      .select('file.*', 'fileType.name as file_type_name')
      .from('work_group_files as file')
      .leftJoin('work_group_folders as folder', 'file.work_group_folder_id', 'folder.id')
      .leftJoin('file_types as fileType', 'file.file_type_id', 'fileType.id')
      .where('file.status', 'trashed')
      .where('folder.status', 'active')
      .where('folder.case_id', caseId)
    const fileData = files as WorkGroupFileItem[]
    return fileData
  }

  public static async getFileSizeByFolderIds(folderIds: number[]): Promise<number> {
    const files = await WorkGroupFile.query()
      .sum('size as total_size')
      .whereIn('work_group_folder_id', folderIds)
      .pojo<{ total_size: number }>()
      .reporterData({ name: 'WorkGroupFile.getFileSizeByFolderIds' })
      .first()

    return files?.total_size ?? 0
  }
}
