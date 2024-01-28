import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Case from 'App/Models/Case'
import Database from '@ioc:Adonis/Lucid/Database'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import { WorkGroupFolderItem, WorkGroupFolderTreeItem, WorkGroupFolderStatus } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'

export default class WorkGroupFolder extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public caseId: number

  @column()
  public parentId: number

  @column()
  public ownerId: number

  @column()
  public name: string

  @column()
  public access: 'private' | 'shared'

  @column()
  public status: WorkGroupFolderStatus

  @column()
  public ownerName: string

  @column()
  public notes: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Case)
  public case: BelongsTo<typeof Case>

  @belongsTo(() => User, {
    foreignKey: 'ownerId',
    localKey: 'id',
  })
  public owner: BelongsTo<typeof User>

  @hasMany(() => WorkGroupFile)
  public files: HasMany<typeof WorkGroupFile>

  public static async getCaseId(folderId: number): Promise<number | null> {
    const folder = await WorkGroupFolder.query()
      .select('case_id')
      .where('id', folderId)
      .pojo<{ case_id: number }>()
      .first()

    return folder?.case_id ?? null
  }

  public static async getFolderChildren(folderId: number, status: WorkGroupFolderStatus[]) {
    const query = await WorkGroupFolder.query()
      .select('id', 'parent_id', 'name', 'status', 'owner_name', 'notes', 'access', 'updated_at')
      .where('parent_id', folderId)
      .whereIn('status', status)
      .orderBy('name', 'asc')

    const files = await WorkGroupFile.getFilesIn(folderId, status, 1, 10)

    const folders: WorkGroupFolderTreeItem[] = []

    for (let item of query) {
      const serialized = item.serialize() as WorkGroupFolderItem
      const hasChildren = await WorkGroupFolder.hasChildFolders(item.id, status)
      folders.push({ ...serialized, hasFolders: hasChildren })
    }

    return { folders, files }
  }

  public static async getRootFolderChildren(caseId: number, status: WorkGroupFolderStatus[]) {
    const root = await WorkGroupFolder.query()
      .where('case_id', caseId)
      .where('parent_id', 0)
      .firstOrFail()

    const data = await WorkGroupFolder.getFolderChildren(root.id, status)

    return data
  }

  public static async getFolders(
    caseId: number,
    status: WorkGroupFolderStatus[]
  ): Promise<WorkGroupFolderItem[]> {
    const query = await Database.query()
      .withRecursive('tree', (query) => {
        query
          .from('work_group_folders')
          .select(
            'id',
            'parent_id',
            'name',
            'status',
            'owner_name',
            'notes',
            'access',
            'updated_at'
          )
          .where('case_id', caseId)
          .where('parent_id', 0)
          .union((subquery) => {
            subquery
              .from('work_group_folders as w')
              .select(
                'w.id',
                'w.parent_id',
                'w.name',
                'w.status',
                'w.owner_name',
                'w.notes',
                'w.access',
                'w.updated_at'
              )
              .innerJoin('tree', 'tree.id', '=', 'w.parent_id')
          })
      })
      .whereIn('status', status)
      .from('tree')
    return query as WorkGroupFolderItem[]
  }

  public static async getFoldersWithPath(
    caseId: number,
    parentId = 0,
    status: WorkGroupFolderStatus[]
  ): Promise<WorkGroupFolderItem[]> {
    const query = `WITH RECURSIVE work_group_tree (id, parent_id, name, status, owner_name, notes, access, updated_at, path) AS (
      SELECT id, parent_id, name, status, owner_name, notes, access, updated_at, CONCAT(name, '/') as path
      FROM work_group_folders
      WHERE case_id = ? AND parent_id = ?
      UNION ALL
      SELECT t.id, t.parent_id, t.name, t.status, t.owner_name, t.notes, t.access, t.updated_at, CONCAT(tp.path, t.name, '/')
      FROM work_group_tree AS tp
      JOIN work_group_folders AS t ON tp.id = t.parent_id
    )
    SELECT * FROM work_group_tree WHERE status IN (?) ORDER BY parent_id`

    const result = await Database.rawQuery(query, [caseId, parentId, status.join(',')])
    const folders = result[0] as WorkGroupFolderItem[]

    let items: WorkGroupFolderItem[] = []

    for (let folder of folders) {
      items.push({
        id: folder.id,
        parent_id: folder.parent_id,
        name: folder.name,
        status: folder.status,
        owner_name: folder.owner_name,
        notes: folder.notes,
        access: folder.access,
        updated_at: folder.updated_at,
        path: folder.path.replace('Workgroup/', `w/${caseId}/`),
      })
    }

    return items
  }

  public static async getFoldersIn(
    caseId: number,
    folderId: number,
    status: WorkGroupFolderStatus[]
  ): Promise<WorkGroupFolderItem[]> {
    const query = await Database.query()
      .withRecursive('tree', (query) => {
        query
          .from('work_group_folders')
          .select(
            'id',
            'parent_id',
            'name',
            'status',
            'owner_name',
            'notes',
            'access',
            'updated_at'
          )
          .where('case_id', caseId)
          .where('parent_id', folderId)
          .union((subquery) => {
            subquery
              .from('work_group_folders as w')
              .select(
                'w.id',
                'w.parent_id',
                'w.name',
                'w.status',
                'w.owner_name',
                'w.notes',
                'w.access',
                'w.updated_at'
              )
              .innerJoin('tree', 'tree.id', '=', 'w.parent_id')
          })
      })
      .whereIn('status', status)
      .from('tree')

    return query as WorkGroupFolderItem[]
  }

  public static async getSelectedFolders(folderIds: number[]) {
    const rows = await Database.from('work_group_folders')
      .select(['id', 'parent_id', 'name', 'status', 'owner_name', 'notes', 'updated_at'])
      .whereIn('id', folderIds)
      .orderBy('parent_id', 'asc')

    return rows as WorkGroupFolderItem[]
  }

  /** Only looks or immediate children */
  public static async hasChildFolders(
    folderId: number,
    status: WorkGroupFolderStatus[]
  ): Promise<boolean> {
    const count = await Database.from('work_group_folders')
      .where('parent_id', folderId)
      .whereIn('status', status)
      .count('id as total')

    return count[0].total > 0
  }

  public static async isChildFolder(
    userId: number,
    parentFolderId: number,
    possibleChildId: number,
    status: WorkGroupFolderStatus = 'active'
  ): Promise<boolean> {
    const parent = await WorkGroupFolder.query()
      .select('id', 'parent_id')
      .where('id', parentFolderId)
      .firstOrFail()

    if (parent.parentId === 0) {
      return false
    }

    const folders = await WorkGroupFolder.getFoldersIn(userId, parentFolderId, [status])
    const childFolderIds = folders.map((f) => f.id)

    return childFolderIds.includes(possibleChildId)
  }

  public static async getFolderIdsIn(
    caseId: number,
    folderId: number,
    status: WorkGroupFolderStatus[] = ['active']
  ): Promise<number[]> {
    const query = await Database.query()
      .withRecursive('tree', (query) => {
        query
          .from('work_group_folders')
          .select('id', 'parent_id', 'name', 'status')
          .where('case_id', caseId)
          .where('parent_id', folderId)
          .union((subquery) => {
            subquery
              .from('work_group_folders as w')
              .select('w.id', 'w.parent_id', 'w.name', 'w.status')
              .innerJoin('tree', 'tree.id', '=', 'w.parent_id')
          })
      })
      .whereIn('status', status)
      .from('tree')

    return query.map((q) => q.id)
  }
}
