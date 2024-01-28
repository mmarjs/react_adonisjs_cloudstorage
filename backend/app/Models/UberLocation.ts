import { DateTime } from 'luxon'
import UberTripHistory from 'App/Models/UberTripHistory'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class UberLocation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uberTripHistoryId: number

  @column()
  public latitude: number

  @column()
  public longitude: number

  @column()
  public bearing: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => UberTripHistory)
  public history: BelongsTo<typeof UberTripHistory>
}
