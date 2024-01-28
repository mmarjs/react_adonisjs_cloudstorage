import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import PersonalFile from 'App/Models/PersonalFile'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import ShareResource from 'App/Models/ShareResource'
import { ShareLinkType } from 'App/types'
import Company from 'App/Models/Company'

export default class ShareLink extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public companyId: number

  @column()
  public grantedById: number

  @column()
  public link: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public salt: string

  @column()
  public lastName: string

  @column()
  public firstName: string

  @column()
  public phone: string

  @column()
  public companyName: string

  @column()
  public resource: ShareLinkType

  @column()
  public resourceId: number

  @column()
  public folderId: number

  @column()
  public subject: string

  @column()
  public message: string

  @column()
  public canUpdatePassword: boolean

  @column()
  public canTrash: boolean

  @column()
  public shareType: 'upload' | 'download'

  @column.dateTime()
  public lastLogin: DateTime

  @column()
  public visits: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @belongsTo(() => User, {
    foreignKey: 'grantedById',
    localKey: 'id',
  })
  public grantedBy: BelongsTo<typeof User>

  @hasMany(() => ShareResource)
  public resources: HasMany<typeof ShareResource>

  public static async exists(link: string): Promise<boolean> {
    const shareLink = await ShareLink.query()
      .select('id')
      .where('link', link)
      .pojo<{ id: number }>()
      .first()

    return shareLink !== null
  }

  public static async getResourceId(
    resource: ShareLinkType,
    folderId: number,
    userId: number
  ): Promise<number> {
    if (resource === 'work_group') {
      const folder = await WorkGroupFolder.query()
        .select('case_id')
        .where('id', folderId)
        .pojo<{ case_id: number }>()
        .firstOrFail()

      return folder.case_id
    } else {
      return userId
    }
  }

  public static async downloadFiles(shareLink: ShareLink) {
    await shareLink.load('resources')

    if (shareLink.resource === 'work_group') {
      let fileIds = shareLink.resources
        .filter((q) => q.resource === 'work_group_files')
        .map((p) => p.resourceId)

      return await WorkGroupFile.getSelectedFiles(fileIds, ['active'])
    }

    if (shareLink.resource === 'personal') {
      let fileIds = shareLink.resources
        .filter((q) => q.resource === 'personal_files')
        .map((p) => p.resourceId)

      return await PersonalFile.getSelectedFiles(fileIds, ['active'])
    }

    return []
  }
}
