import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Company from 'App/Models/User'
import { EventName } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class NotificationSetting extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public event: EventName

  @column({ serialize: (value: number): boolean => !!value, serializeAs: 'sendApp' })
  public sendApp: boolean

  @column({ serialize: (value: number): boolean => !!value, serializeAs: 'sendEmail' })
  public sendEmail: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  public static async byName(userId: number, companyId: number, event: EventName) {
    return await NotificationSetting.query()
      .where({ userId })
      .where({ companyId })
      .where({ event })
      .first()
  }

  public static async byUser(userId: number, companyId: number, fields: string[]) {
    return await NotificationSetting.query().select(fields).where({ userId }).where({ companyId })
  }
}
