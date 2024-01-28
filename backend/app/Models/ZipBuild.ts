import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import { ZipExport } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class ZipBuild extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public link: string

  @column({
    prepare: (value: object) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  public input: object

  @column({
    prepare: (value: object) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  public output: ZipExport

  @column()
  public downloadedBy: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public downloadedAt: DateTime | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>
}
