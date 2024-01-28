import { DateTime } from 'luxon'
import { EventName, EventData, JobName } from 'App/types'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class HandlingError extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number | null

  @column()
  public companyId: number | null

  @column()
  public event: EventName | JobName

  @column({
    prepare: (value: object) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  public data: EventData

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
