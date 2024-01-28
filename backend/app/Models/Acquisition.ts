import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Custodian from 'App/Models/Custodian'
import ServiceItem from 'App/Models/ServiceItem'
import AcquisitionTask from 'App/Models/AcquisitionTask'
import AcquisitionException from 'App/Models/AcquisitionException'
import Evidence from 'App/Models/Evidence'

export default class Acquisition extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public custodianId: number

  @column()
  public cloudAccountUsername: string

  @column()
  public acquisitionType: string

  @column.dateTime()
  public after: DateTime | null

  @column.dateTime()
  public before: DateTime | null

  @column()
  public status: 'auth_pending' | 'in_progress' | 'collected' | 'archived' | 'canceled'

  @column()
  public scopes: string | null

  @column()
  public accessToken: string | null

  @column.dateTime()
  public accessTokenExpiresAt: DateTime | null

  @column()
  public refreshToken: string | null

  @column.dateTime()
  public refreshTokenExpiresAt: DateTime | null

  @column()
  public nonce: string | null

  @column()
  public requestedById: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public authorizedByUserAt: DateTime | null

  @column.dateTime()
  public startedCollectionAt: DateTime | null

  @column.dateTime()
  public endedCollectionAt: DateTime | null

  @belongsTo(() => Custodian)
  public custodian: BelongsTo<typeof Custodian>

  @hasOne(() => Evidence)
  public evidence: HasOne<typeof Evidence>

  @manyToMany(() => ServiceItem)
  public serviceItems: ManyToMany<typeof ServiceItem>

  @belongsTo(() => User, {
    foreignKey: 'requestedById',
    localKey: 'id',
  })
  public requestedBy: BelongsTo<typeof User>

  @hasMany(() => AcquisitionException)
  public exceptions: HasMany<typeof AcquisitionException>

  @hasMany(() => AcquisitionTask)
  public tasks: HasMany<typeof AcquisitionTask>
}
