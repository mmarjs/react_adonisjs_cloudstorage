import ShareLink from 'App/Models/ShareLink'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import PersonalFolder from 'App/Models/PersonalFolder'

export default class FetchShareLinks {
  public userId: number
  public companyId: number
  public caseId: number

  constructor(userId: number, companyId: number, caseId: number) {
    this.userId = userId
    this.companyId = companyId
    this.caseId = caseId
  }

  public async fetch() {
    const personalLinks = await this.personal()
    const workGroupLinks = await this.workgroup()
    return [...personalLinks, ...workGroupLinks]
  }

  private async personal() {
    const folders = await PersonalFolder.getFolders(this.userId, this.companyId, ['active'])
    const userFolderIds = folders.map((f) => f.id)

    return await ShareLink.query()
      .select(
        'id',
        'granted_by_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'created_at',
        'share_type',
        'expires_at',
        'last_login'
      )
      .where('resource', 'personal')
      .whereIn('folder_id', userFolderIds)
      .whereNull('deleted_at')
      .orderBy('folder_id', 'asc')
      .preload('grantedBy', (q) => q.select('first_name', 'last_name'))
  }

  private async workgroup() {
    const folders = await WorkGroupFolder.getFolders(this.caseId, ['active'])
    const caseFolderIds = folders.map((f) => f.id)

    return await ShareLink.query()
      .select(
        'id',
        'granted_by_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'created_at',
        'share_type',
        'expires_at',
        'last_login'
      )
      .where('resource', 'work_group')
      .whereIn('folder_id', caseFolderIds)
      .whereNull('deleted_at')
      .orderBy('folder_id', 'asc')
      .preload('grantedBy', (q) => q.select('first_name', 'last_name'))
  }
}
