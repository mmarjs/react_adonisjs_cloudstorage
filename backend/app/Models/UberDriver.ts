import { DateTime } from 'luxon'
import UberTripHistory from 'App/Models/UberTripHistory'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class UberDriver extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uberTripHistoryId: number

  @column()
  public phoneNumber: string

  @column()
  public smsNumber: string

  @column()
  public rating: number

  @column()
  public pictureUrl: string

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => UberTripHistory)
  public history: BelongsTo<typeof UberTripHistory>
}
