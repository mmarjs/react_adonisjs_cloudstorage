import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import PersonalFile from 'App/Models/PersonalFile'
import Database from '@ioc:Adonis/Lucid/Database'
import { PersonalFolderStatus, PersonalFolderItem, PersonalFolderChildItem } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

export default class PersonalFolder extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public parentId: number

  @column()
  public companyId: number

  @column()
  public name: string

  @column()
  public access: 'private' | 'shared'

  @column()
  public status: PersonalFolderStatus

  @column()
  public notes: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @hasMany(() => PersonalFile)
  public files: HasMany<typeof PersonalFile>

  public static async getFolderChildren(folderId: number, status: PersonalFolderStatus[]) {
    const query = await PersonalFolder.query()
      .select('id', 'parent_id', 'name', 'status', 'notes', 'access', 'updated_at')
      .where('parent_id', folderId)
      .whereIn('status', status)
      .orderBy('name', 'asc')

    const files = await PersonalFile.getFilesIn(folderId, status, 1, 10)

    const folders: PersonalFolderChildItem[] = []

    for (let item of query) {
      const serialized = item.serialize() as PersonalFolderItem
      const hasChildren = await PersonalFolder.hasChildFolders(item.id, status)
      folders.push({ ...serialized, hasFolders: hasChildren })
    }

    return { folders, files }
  }

  public static async getRootFolderChildren(userId: number, status: PersonalFolderStatus[]) {
    const root = await PersonalFolder.query()
      .where('user_id', userId)
      .where('parent_id', 0)
      .firstOrFail()

    const data = await PersonalFolder.getFolderChildren(root.id, status)

    return data
  }

  public static async getFolders(
    userId: number,
    companyId: number,
    status: PersonalFolderStatus[]
  ): Promise<PersonalFolderItem[]> {
    const query = await Database.query()
      .withRecursive('tree', (query) => {
        query
          .from('personal_folders')
          .select('id', 'parent_id', 'name', 'status', 'notes', 'access', 'updated_at')
          .where('user_id', userId)
          .where('company_id', companyId)
          .where('parent_id', 0)
          .union((subquery) => {
            subquery
              .from('personal_folders as p')
              .select(
                'p.id',
                'p.parent_id',
                'p.name',
                'p.status',
                'p.notes',
                'p.access',
                'p.updated_at'
              )
              .innerJoin('tree', 'tree.id', '=', 'p.parent_id')
          })
      })
      .whereIn('status', status)
      .from('tree')

    return query as PersonalFolderItem[]
  }

  public static async getFoldersIn(
    userId: number,
    folderId: number,
    status: PersonalFolderStatus[]
  ): Promise<PersonalFolderItem[]> {
    const query = await Database.query()
      .withRecursive('tree', (query) => {
        query
          .from('personal_folders')
          .select('id', 'parent_id', 'name', 'status', 'notes', 'access', 'updated_at')
          .where('user_id', userId)
          .where('parent_id', folderId)
          .union((subquery) => {
            subquery
              .from('personal_folders as p')
              .select(
                'p.id',
                'p.parent_id',
                'p.name',
                'p.status',
                'p.notes',
                'p.access',
                'p.updated_at'
              )
              .innerJoin('tree', 'tree.id', '=', 'p.parent_id')
          })
      })
      .whereIn('status', status)
      .from('tree')

    return query as PersonalFolderItem[]
  }

  public static async getFoldersWithPath(
    userId: number,
    parentId = 0,
    status: PersonalFolderStatus[]
  ): Promise<PersonalFolderItem[]> {
    const query = `WITH RECURSIVE personal_tree (id, parent_id, name, status, notes, access, updated_at, path) AS (
        SELECT id, parent_id, name, status, notes, access, updated_at, CONCAT(name, '/') as path
        FROM personal_folders
        WHERE user_id = ? AND parent_id = ?
        UNION ALL
        SELECT t.id, t.parent_id, t.name, t.status, t.notes, t.access, t.updated_at, CONCAT(tp.path, t.name, '/')
        FROM personal_tree AS tp
        JOIN personal_folders AS t ON tp.id = t.parent_id
      )
      SELECT * FROM personal_tree WHERE status IN (?) ORDER BY parent_id`

    const result = await Database.rawQuery(query, [userId, parentId, status.join(',')])
    const folders = result[0] as PersonalFolderItem[]

    let items: PersonalFolderItem[] = []

    for (let folder of folders) {
      items.push({
        id: folder.id,
        parent_id: folder.parent_id,
        name: folder.name,
        status: folder.status,
        notes: folder.notes,
        access: folder.access,
        updated_at: folder.updated_at,
        path: folder.path.replace('Personal/', `p/`),
      })
    }

    return items
  }

  public static async getSelectedFolders(folderIds: number[]) {
    const rows = await Database.from('personal_folders')
      .select(['id', 'parent_id', 'name', 'status', 'notes', 'updated_at'])
      .whereIn('id', folderIds)
      .orderBy('parent_id', 'asc')

    return rows as PersonalFolderItem[]
  }

  /** Only looks or immediate children */
  public static async hasChildFolders(
    folderId: number,
    status: PersonalFolderStatus[]
  ): Promise<boolean> {
    const count = await Database.from('personal_folders')
      .where('parent_id', folderId)
      .whereIn('status', status)
      .count('id as total')

    return count[0].total > 0
  }

  public static async isChildFolder(
    userId: number,
    parentFolderId: number,
    possibleChildId: number,
    status: PersonalFolderStatus = 'active'
  ): Promise<boolean> {
    const parent = await PersonalFolder.query()
      .select('id', 'parent_id')
      .where('id', parentFolderId)
      .firstOrFail()

    if (parent.parentId === 0) {
      return false
    }

    const folders = await PersonalFolder.getFoldersIn(userId, parentFolderId, [status])
    const childFolderIds = folders.map((f) => f.id)

    return childFolderIds.includes(possibleChildId)
  }

  public static async getFolderIdsIn(
    userId: number,
    folderId: number,
    status: PersonalFolderStatus[] = ['active']
  ): Promise<number[]> {
    const query = await Database.query()
      .withRecursive('tree', (query) => {
        query
          .from('personal_folders')
          .select('id', 'parent_id', 'name', 'status')
          .where('user_id', userId)
          .where('parent_id', folderId)
          .union((subquery) => {
            subquery
              .from('personal_folders as p')
              .select('p.id', 'p.parent_id', 'p.name', 'p.status')
              .innerJoin('tree', 'tree.id', '=', 'p.parent_id')
          })
      })
      .whereIn('status', status)
      .from('tree')

    return query.map((p) => p.id)
  }
}
