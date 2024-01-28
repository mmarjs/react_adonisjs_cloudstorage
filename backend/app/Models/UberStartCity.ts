import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import UberTripHistory from 'App/Models/UberTripHistory'

export default class UberStartCity extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uberTripHistoryId: number

  @column()
  public latitude: number

  @column()
  public displayName: string

  @column()
  public longitude: number

  @column()
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => UberTripHistory)
  public history: BelongsTo<typeof UberTripHistory>
}
