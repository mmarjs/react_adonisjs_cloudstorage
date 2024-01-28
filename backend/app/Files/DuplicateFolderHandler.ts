import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import PersonalFolder from 'App/Models/PersonalFolder'
import { WorkGroupFolderStatus } from 'App/types'

export default class DuplicateFolderHandler {
  public resource: 'workgroup' | 'personal'
  public resourceId: number
  public parentId: number
  public folderName: string
  public status: WorkGroupFolderStatus

  constructor(
    resource: 'workgroup' | 'personal',
    resourceId: number,
    parentId: number,
    folderName: string,
    status: WorkGroupFolderStatus = 'active'
  ) {
    this.resource = resource
    this.resourceId = resourceId
    this.parentId = parentId
    this.folderName = folderName
    this.status = status
  }

  public async handle(): Promise<string> {
    if (this.resource === 'workgroup') {
      return await this.handleWorkGroup()
    }

    return await this.handlePersonal()
  }

  public async handleWorkGroup(): Promise<string> {
    if (await this.workGroupFolderNameConflicts()) {
      const ordinal = await this.workGroupFindNextOrdinal()
      return this.formatDuplicateFolderName(ordinal)
    }

    return this.folderName
  }

  public async handlePersonal(): Promise<string> {
    if (await this.personalFolderNameConflicts()) {
      const ordinal = await this.personalFindNextOrdinal()
      return this.formatDuplicateFolderName(ordinal)
    }

    return this.folderName
  }

  public async workGroupFolderNameConflicts(): Promise<boolean> {
    const folders = await WorkGroupFolder.query()
      .count('id as total')
      .where('case_id', this.resourceId)
      .where('parent_id', this.parentId)
      .where('name', this.folderName)
      .where('status', this.status)
      .pojo<{ total: number }>()

    return Boolean(folders[0].total)
  }

  public async personalFolderNameConflicts(): Promise<boolean> {
    const folders = await PersonalFolder.query()
      .count('id as total')
      .where('user_id', this.resourceId)
      .where('parent_id', this.parentId)
      .where('name', this.folderName)
      .where('status', this.status)
      .pojo<{ total: number }>()

    return Boolean(folders[0].total)
  }

  public async workGroupFindNextOrdinal(): Promise<number> {
    const folders = await WorkGroupFolder.query()
      .select('name')
      .where('case_id', this.resourceId)
      .where('parent_id', this.parentId)
      .where('status', this.status)
      .where('name', 'like', `${this.folderName} (%)`)

    return folders.length + 1
  }

  public async personalFindNextOrdinal(): Promise<number> {
    const folders = await PersonalFolder.query()
      .select('name')
      .where('user_id', this.resourceId)
      .where('parent_id', this.parentId)
      .where('status', this.status)
      .where('name', 'like', `${this.folderName} (%)`)

    return folders.length + 1
  }

  public formatDuplicateFolderName(ordinal: number): string {
    return `${this.folderName} (${ordinal})`
  }
}
