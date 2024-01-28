import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Acquisition from 'App/Models/Acquisition'
import EvidenceItem from 'App/Models/EvidenceItem'
import Service from 'App/Models/Service'

export default class Evidence extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public acquisitionId: number

  @column()
  public serviceId: number

  @column()
  public publicEvidenceId: string

  @column()
  public status: 'auth_pending' | 'in_progress' | 'collected' | 'archived' | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Acquisition)
  public acquisition: BelongsTo<typeof Acquisition>

  @belongsTo(() => Service)
  public service: BelongsTo<typeof Service>

  @hasMany(() => EvidenceItem)
  public items: HasMany<typeof EvidenceItem>
}
