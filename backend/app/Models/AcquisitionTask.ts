import { DateTime } from 'luxon'
import Acquisition from 'App/Models/Acquisition'
import ServiceItem from 'App/Models/ServiceItem'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class AcquisitionTask extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public acquisitionId: number

  @column()
  public serviceItemId: number

  @column()
  public serviceName: string

  @column()
  public description: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public finishedAt: DateTime

  @belongsTo(() => Acquisition)
  public acquisition: BelongsTo<typeof Acquisition>

  @belongsTo(() => ServiceItem)
  public serviceItem: BelongsTo<typeof ServiceItem>
}
