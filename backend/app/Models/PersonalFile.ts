import { DateTime } from 'luxon'
import { flatten } from 'lodash'
import FileType from 'App/Models/FileType'
import Database from '@ioc:Adonis/Lucid/Database'
import PersonalFolder from 'App/Models/PersonalFolder'
import { PersonalFileStatus, PersonalFileItem } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo, scope } from '@ioc:Adonis/Lucid/Orm'

export default class PersonalFile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public personalFolderId: number

  @column()
  public fileTypeId: number

  @column()
  public name: string

  @column()
  public path: string

  @column()
  public size: number

  @column()
  public access: 'private' | 'shared'

  @column()
  public status: PersonalFileStatus

  @column()
  public notes: string

  @column.dateTime()
  public dateCreated: DateTime

  @column.dateTime()
  public lastModified: DateTime

  @column.dateTime()
  public lastAccessed: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => PersonalFolder)
  public folder: BelongsTo<typeof PersonalFolder>

  @belongsTo(() => FileType)
  public fileType: BelongsTo<typeof FileType>

  public static byFolderAndName = scope(
    (query, folderId: number, name: string, status?: PersonalFileStatus) => {
      query.where('personal_folder_id', folderId).where('name', name)

      if (status) {
        query.where('status', status)
      }
    }
  )

  public static async getFiles(
    folderIds: number[],
    status: PersonalFileStatus[]
  ): Promise<PersonalFileItem[]> {
    const files = await PersonalFile.query()
      .whereIn('status', status)
      .whereIn('personal_folder_id', folderIds)
      .orderBy('personal_folder_id', 'asc')
      .orderBy('name', 'asc')
      .preload('fileType', (f) => f.select(['name']))

    return files.map((file) => file.serialize()) as PersonalFileItem[]
  }

  public static async getFilesIn(
    folderId: number,
    status: PersonalFileStatus[],
    page: number,
    limit: number
  ): Promise<PersonalFileItem[]> {
    const files = await Database.query()
      .select('file.*', 'fileType.name as file_type_name')
      .from('personal_files as file')
      .leftJoin('file_types as fileType', 'file.file_type_id', 'fileType.id')
      .whereIn('status', status)
      .where('personal_folder_id', folderId)
      .orderBy('name', 'asc')
      .paginate(page, limit)
    return files as PersonalFileItem[]
  }

  public static async getFilesIdsInFolder(
    folderId: number,
    status: PersonalFileStatus
  ): Promise<number[]> {
    const files = await PersonalFile.query()
      .select('id')
      .where('personal_folder_id', folderId)
      .where('status', status)

    return files.map((f) => f.id)
  }

  public static async getSelectedFiles(
    fileIds: number[],
    status: PersonalFileStatus[]
  ): Promise<PersonalFileItem[]> {
    const files = await PersonalFile.query()
      .whereIn('id', fileIds)
      .whereIn('status', status)
      .orderBy('personal_folder_id', 'asc')
      .orderBy('name', 'asc')
      .preload('fileType', (f) => f.select(['name']))

    return files.map((file) => file.serialize() as PersonalFileItem)
  }

  public static async getFilesInSelectedFolders(
    folderIds: number[],
    status: PersonalFileStatus[]
  ): Promise<PersonalFileItem[]> {
    let files: PersonalFileItem[][] = []

    for (let folderId of folderIds) {
      let someFiles = await PersonalFile.getFilesIn(folderId, status, 1, 10)
      files.push(someFiles)
    }

    return flatten(files)
  }

  public static async getTrashedFilesByActiveFolder(
    userId: number,
    companyId: number
  ): Promise<PersonalFileItem[]> {
    const files = await Database.query()
      .select('file.*', 'fileType.name as file_type_name')
      .from('personal_files as file')
      .leftJoin('personal_folders as folder', 'file.personal_folder_id', 'folder.id')
      .leftJoin('file_types as fileType', 'file.file_type_id', 'fileType.id')
      .where('file.status', 'trashed')
      .where('folder.status', 'active')
      .where('folder.user_id', userId)
      .where('folder.company_id', companyId)
    const fileData = files as PersonalFileItem[]
    return fileData
  }

  public static async getFileSizeByFolderIds(folderIds: number[]): Promise<number> {
    const files = await PersonalFile.query()
      .sum('size as total_size')
      .whereIn('personal_folder_id', folderIds)
      .pojo<{ total_size: number }>()
      .reporterData({ name: 'PersonalFile.getFileSizeByFolderIds' })
      .first()

    return files?.total_size ?? 0
  }
}
