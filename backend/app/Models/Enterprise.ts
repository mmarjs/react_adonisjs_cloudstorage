import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import EnterpriseSubscriber from 'App/Models/EnterpriseSubscriber'

export default class Enterprise extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public subdomain: string

  @column()
  public database: string

  @column()
  public billingStatus: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => EnterpriseSubscriber)
  public subscribers: HasMany<typeof EnterpriseSubscriber>
}
