import { DateTime } from 'luxon'
import EvidenceItem from 'App/Models/EvidenceItem'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class AcquisitionRecord extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public evidenceItemId: number

  @column()
  public recordId: number

  @column()
  public recordTable: string

  @column()
  public recordColumn: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => EvidenceItem)
  public evidenceItem: BelongsTo<typeof EvidenceItem>
}
