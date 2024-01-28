import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import ShareLink from 'App/Models/ShareLink'
import { EmployeeInfo } from 'App/types'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public name: string

  @column()
  public isEnterprise: boolean

  @column()
  public isEnterpriseSubscriber: boolean

  @column()
  public billingStatus: string

  @column({ serialize: (value: number): boolean => !!value })
  public isTwoFactorRequired: boolean

  @column()
  public maxEmployees: number

  @column()
  public channel: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Role)
  public roles: HasMany<typeof Role>

  @hasMany(() => ShareLink)
  public shareLinks: HasMany<typeof ShareLink>

  public static async isAccountOwner(userId: number, companyId: number): Promise<boolean> {
    const company = await Company.query()
      .select('id')
      .where('id', companyId)
      .where('user_id', userId)
      .pojo<{ id: number }>()
      .first()

    return company !== null
  }

  public static async ownsAnyAccounts(userId: number): Promise<boolean> {
    const companies = await Company.query()
      .select('id')
      .where('user_id', userId)
      .pojo<{ id: number }>()
    return companies.length > 0
  }

  public static async isDeleted(companyId: number): Promise<boolean> {
    const company = await Company.query().select('deleted_at').where('id', companyId).first()
    return company?.deletedAt !== null
  }

  public static async employeeInfo(companyId: number): Promise<EmployeeInfo> {
    const maxEmployees = await Company.query()
      .select('max_employees')
      .where('id', companyId)
      .pojo<{ max_employees: number }>()
      .firstOrFail()

    const currentEmployees = await Role.query()
      .count('roles.id as current')
      .innerJoin('users', 'roles.user_id', 'users.id')
      .where('users.status', 'active')
      .where('roles.company_id', companyId)
      .whereIn('role', User.employeeRoles)
      .pojo<{ current: number }>()
      .firstOrFail()

    const current = currentEmployees?.current
    const max = maxEmployees?.max_employees

    return { current, max }
  }
}
