import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import { PreferenceName } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class Preference extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public name: PreferenceName

  @column({ serialize: (value: number): boolean => !!value })
  public option: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  public static async byUser(userId: number, companyId: number) {
    return await Preference.query().where({ userId }).where({ companyId })
  }
}
