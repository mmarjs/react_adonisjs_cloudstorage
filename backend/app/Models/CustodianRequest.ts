import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Acquisition from 'App/Models/Acquisition'
import Custodian from 'App/Models/Custodian'

export default class CustodianRequest extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public custodianId: number

  @column()
  public acquisitionId: number

  @column()
  public email: string

  @column()
  public token: string

  @column()
  public status: 'sent' | 'in_progress' | 'finished' | 'archived'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Acquisition)
  public acquisition: BelongsTo<typeof Acquisition>

  @belongsTo(() => Custodian)
  public custodian: BelongsTo<typeof Custodian>
}
