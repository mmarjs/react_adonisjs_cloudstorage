import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
  computed,
} from '@ioc:Adonis/Lucid/Orm'
import Permission from 'App/Models/Permission'
import Company from 'App/Models/Company'
import Role from 'App/Models/Role'
import Enterprise from 'App/Models/Enterprise'
import PasswordReset from 'App/Models/PasswordReset'
import { TwoFactorMethods, UserStatus } from 'App/types'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public salt: string

  @column()
  public firstName: string

  @column()
  public lastName: string

  @column()
  public status: UserStatus

  @column()
  public phone: string | null

  @column()
  public street: string | null

  @column()
  public city: string | null

  @column()
  public state: string | null

  @column()
  public zip: number | null

  @column()
  public companyName: string | null

  @column()
  public verified: boolean

  @column()
  public verificationToken: string | null

  @column({ serialize: (value: number): boolean => !!value })
  public isTwoFactorRequired: boolean

  @column()
  public twoFactorMethod: TwoFactorMethods

  @column()
  public channel: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public lastLogin: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @computed()
  public get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  @computed()
  public get signature() {
    return `${this.firstName} ${this.lastName} (${this.email})`
  }

  @hasOne(() => Company)
  public company: HasOne<typeof Company>

  @hasOne(() => Enterprise)
  public enterprise: HasOne<typeof Enterprise>

  @hasMany(() => Permission)
  public permissions: HasMany<typeof Permission>

  @hasMany(() => PasswordReset)
  public resets: HasMany<typeof PasswordReset>

  @hasMany(() => Role)
  public roles: HasMany<typeof Role>

  public static adminRoles = ['account-owner', 'account-admin']
  public static employeeRoles = ['account-admin', 'case-manager']
  public static clientRoles = ['client-user']
  public static nonAdminRoles = ['case-manager', 'client-user']
}
