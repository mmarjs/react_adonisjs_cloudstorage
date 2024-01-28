import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Service from 'App/Models/Service'
import EvidenceItem from 'App/Models/EvidenceItem'
import Acquisition from 'App/Models/Acquisition'
import AcquisitionTask from 'App/Models/AcquisitionTask'

export default class ServiceItem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public serviceId: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Service)
  public service: BelongsTo<typeof Service>

  @hasMany(() => EvidenceItem)
  public evidenceItems: HasMany<typeof EvidenceItem>

  @manyToMany(() => Acquisition)
  public acquisitions: ManyToMany<typeof Acquisition>

  @hasMany(() => AcquisitionTask)
  public tasks: HasMany<typeof AcquisitionTask>
}
