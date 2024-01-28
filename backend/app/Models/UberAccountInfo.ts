import { DateTime } from 'luxon'
import Acquisition from 'App/Models/Acquisition'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class UberAccountInfo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public acquisitionId: number

  @column()
  public picture: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public uuid: string

  @column()
  public email: string

  @column()
  public mobileVerified: boolean

  @column()
  public promoCode: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Acquisition)
  public acquisition: BelongsTo<typeof Acquisition>
}
