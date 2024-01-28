import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Evidence from 'App/Models/Evidence'
import ServiceItem from 'App/Models/ServiceItem'
import AcquisitionRecord from 'App/Models/AcquisitionRecord'

export default class EvidenceItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public evidenceId: number

  @column()
  public serviceItemId: number

  @column()
  public status: 'pending' | 'stored'

  @column()
  public nonce: string

  @column()
  public fileEnding: string

  @column()
  public path: string

  @column()
  public size: number

  @column()
  public md5: string

  @column()
  public sha1: string

  @column()
  public dateCollected: DateTime

  @belongsTo(() => Evidence)
  public evidence: BelongsTo<typeof Evidence>

  @belongsTo(() => ServiceItem)
  public serviceItem: BelongsTo<typeof ServiceItem>

  @hasOne(() => AcquisitionRecord)
  public acquisitonRecords: HasOne<typeof AcquisitionRecord>
}
