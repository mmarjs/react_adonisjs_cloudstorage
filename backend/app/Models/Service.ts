import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import ServiceItem from 'App/Models/ServiceItem'
import Evidence from 'App/Models/Evidence'

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public active: boolean

  @column()
  public filterable: boolean

  @column()
  public type: 'api' | 'upload'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => ServiceItem)
  public items: HasMany<typeof ServiceItem>

  @hasMany(() => Evidence)
  public evidences: HasMany<typeof Evidence>
}
