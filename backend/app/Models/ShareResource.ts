import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import ShareLink from 'App/Models/ShareLink'
import { ShareResourceType } from 'App/types'

export default class ShareResource extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public shareLinkId: number

  @column()
  public resource: ShareResourceType

  @column()
  public resourceId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => ShareLink)
  public link: BelongsTo<typeof ShareLink>
}
