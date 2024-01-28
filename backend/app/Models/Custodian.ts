import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Case from 'App/Models/Case'
import Acquisition from 'App/Models/Acquisition'

export default class Custodian extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public caseId: number

  @column()
  public email: string

  @column()
  public name: string

  @column()
  public alias: string

  @column()
  public phone: string

  @column()
  public notes: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Case)
  public case: BelongsTo<typeof Case>

  @hasMany(() => Acquisition)
  public acquisitions: HasMany<typeof Acquisition>
}
