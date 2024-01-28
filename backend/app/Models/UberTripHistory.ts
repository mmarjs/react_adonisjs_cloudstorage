import { DateTime } from 'luxon'
import Acquisition from 'App/Models/Acquisition'
import UberStartCity from 'App/Models/UberStartCity'
import UberDriver from 'App/Models/UberDriver'
import UberVehicle from 'App/Models/UberVehicle'
import UberLocation from 'App/Models/UberLocation'
import UberPickup from 'App/Models/UberPickup'
import UberDestination from 'App/Models/UberDestination'
import UberWaypoint from 'App/Models/UberWaypoint'
import UberRider from 'App/Models/UberRider'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'

export default class UberTripHistory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public acquisitionId: number

  @column()
  public status: string

  @column()
  public distance: number

  @column()
  public startTime: number

  @column()
  public endTime: number

  @column()
  public requestTime: number

  @column()
  public productId: string

  @column()
  public requestId: string

  @column()
  public surgeMultiplier: number

  @column()
  public shared: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Acquisition)
  public acquisition: BelongsTo<typeof Acquisition>

  @hasOne(() => UberStartCity)
  public startCity: HasOne<typeof UberStartCity>

  @hasOne(() => UberDriver)
  public driver: HasOne<typeof UberDriver>

  @hasOne(() => UberVehicle)
  public vehicle: HasOne<typeof UberVehicle>

  @hasOne(() => UberLocation)
  public location: HasOne<typeof UberLocation>

  @hasOne(() => UberPickup)
  public pickup: HasOne<typeof UberPickup>

  @hasOne(() => UberDestination)
  public destination: HasOne<typeof UberDestination>

  @hasMany(() => UberWaypoint)
  public waypoints: HasMany<typeof UberWaypoint>

  @hasMany(() => UberRider)
  public riders: HasMany<typeof UberRider>
}
