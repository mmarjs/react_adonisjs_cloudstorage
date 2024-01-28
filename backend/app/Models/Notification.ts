import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import { EventName } from 'App/types'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public eventId: number

  @column()
  public event: EventName

  @column()
  public message: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime()
  public dismissedAt: DateTime | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  public static async getUser(id: number) {
    const user = await Notification.query()
      .select('users.first_name', 'users.last_name', 'users.email')
      .join('users', 'notifications.user_id', 'users.id')
      .where('notifications.id', id)
      .pojo<{ first_name: string; last_name: string; email: string }>()
      .firstOrFail()

    return user
  }

  public static async userNotifications(userId: number, companyId: number, fields: string[]) {
    return await Notification.query()
      .select(fields)
      .where({ userId })
      .where({ companyId })
      .orderBy('created_at', 'desc')
      .whereNull('dismissed_at')
      .reporterData({ name: 'Notification.userNotifications' })
  }

  public static async notificationCount(userId: number, companyId: number) {
    const count = await Notification.query()
      .count('id as total')
      .where({ userId })
      .where({ companyId })
      .whereNull('dismissed_at')
      .reporterData({ name: 'Notification.userNotifications' })
      .pojo<{ total: number }>()
      .firstOrFail()

    return count.total
  }
}
