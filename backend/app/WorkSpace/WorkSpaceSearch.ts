import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import PersonalFile from 'App/Models/PersonalFile'
import PersonalFolder from 'App/Models/PersonalFolder'
import WorkGroupSearchQuery from 'App/WorkSpace/WorkSpaceSearchQuery'
import { WorkSpaceSearchBody, WorkSpaceSearchQueryConditions } from 'App/types'

export default class WorkSpaceSearch {
  public body: WorkSpaceSearchBody
  public companyId: number
  public conditions: WorkSpaceSearchQueryConditions

  constructor(body: WorkSpaceSearchBody, companyId: number) {
    this.body = body
    this.companyId = companyId
  }

  public async search() {
    const conditions: WorkSpaceSearchQueryConditions = await this.getConditions()
    this.conditions = conditions

    if (this.body.category === 'workgroup') {
      return await this.searchWorkGroup()
    }

    if (this.body.category === 'personal') {
      return await this.searchPersonal()
    }

    return null
  }

  public async getConditions(): Promise<WorkSpaceSearchQueryConditions> {
    const workGroupQuery = new WorkGroupSearchQuery(this.body)

    if (this.body.search_type === 'simple') {
      return workGroupQuery.simple()
    }

    return await workGroupQuery.advanced()
  }

  protected async searchWorkGroup() {
    const body = this.body
    const conditions = this.conditions

    const folders = await WorkGroupFolder.getFoldersIn(body.category_id, body.folder_id, ['active'])

    const folderIds = folders.map((f) => f.id)
    folderIds.unshift(body.folder_id)

    const files = await WorkGroupFile.query()
      .whereIn('work_group_folder_id', folderIds)
      .whereRaw(`${conditions.conditions}`, conditions.params)
      .orderBy('work_group_folder_id', 'asc')
      .orderBy('name', 'asc')
      .preload('fileType', (f) => f.select(['name']))
      .preload('folder', (f) => f.select(['name']))
      .paginate(body.page, body.limit)

    return files
  }

  protected async searchPersonal() {
    const body = this.body
    const conditions = this.conditions

    let folderIds: number[] = []

    if (body.folder_id === null) {
      const folders = await PersonalFolder.getFolders(body.category_id, this.companyId, ['active'])
      folderIds = folders.map((f) => f.id)
    } else {
      const folders = await PersonalFolder.getFoldersIn(body.category_id, body.folder_id, [
        'active',
      ])

      folderIds = folders.map((f) => f.id)
      folderIds.unshift(body.folder_id)
    }

    const files = await PersonalFile.query()
      .whereIn('personal_folder_id', folderIds)
      .whereRaw(`${conditions.conditions}`, conditions.params)
      .orderBy('personal_folder_id', 'asc')
      .orderBy('name', 'asc')
      .preload('fileType', (f) => f.select(['name']))
      .preload('folder', (f) => f.select(['name']))
      .paginate(body.page, body.limit)

    return files
  }
}
