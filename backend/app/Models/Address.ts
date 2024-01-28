import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import State from 'App/Models/State'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public addressableId: number

  @column()
  public addressableType: string

  @column()
  public streetAddress: string

  @column()
  public cityAddress: string

  @column()
  public stateId: number

  @column()
  public homePhone: string

  @column()
  public mobilePhone: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => State)
  public state: BelongsTo<typeof State>
}
