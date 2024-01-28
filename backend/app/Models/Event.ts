import { DateTime } from 'luxon'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { EventName, EventData, PolicyResource } from 'App/types'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public resource: PolicyResource | null

  @column()
  public resourceId: number | null

  @column()
  public name: EventName

  @column({
    prepare: (value: object) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  public data: EventData

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  public static async byName(userId: number, companyId: number, name: EventName) {
    return await Event.query().where({ userId }).where({ companyId }).where({ name }).first()
  }

  public static async byUser(userId: number, companyId: number) {
    return await Event.query().where({ userId }).where({ companyId })
  }

  public static async getUser(eventId: number) {
    return await Event.query()
      .select('users.first_name', 'users.last_name', 'companies.name as company_name')
      .join('users', 'events.user_id', 'users.id')
      .join('companies', 'events.company_id', 'companies.id')
      .where('events.id', eventId)
      .pojo<{ first_name: string; last_name: string; company_name: string }>()
      .firstOrFail()
  }
}
