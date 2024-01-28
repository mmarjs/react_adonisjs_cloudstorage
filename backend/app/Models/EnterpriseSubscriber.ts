import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Company from 'App/Models/Company'
import Enterprise from 'App/Models/Enterprise'

export default class EnterpriseSubscriber extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public companyId: number

  @column()
  public enterpriseId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @belongsTo(() => Enterprise)
  public enterprise: BelongsTo<typeof Enterprise>
}
