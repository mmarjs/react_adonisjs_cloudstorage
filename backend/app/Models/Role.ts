import User from 'App/Models/User'
import Company from 'App/Models/Company'
import { DateTime } from 'luxon'
import { AccountRole } from 'App/types'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { BaseModel, column, belongsTo, BelongsTo, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public role: AccountRole

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public disabledAt: DateTime | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  public static byCompany = scope(
    (query, userId: number, companyId: number, role?: AccountRole) => {
      query.where('user_id', userId).where('company_id', companyId)

      if (role) {
        query.where('role', role)
      }
    }
  )

  public static async currentRole(userId: number, companyId: number) {
    const query = await Role.query()
      .select('role')
      .where('user_id', userId)
      .where('company_id', companyId)
      .pojo<{ role: AccountRole }>()
      .reporterData({ name: 'Role.currentRole' })
      .first()

    const role = query?.role

    if (role === undefined) {
      return 'client-user'
    }

    return role
  }

  public static async hasRole(userId: number, companyId: number, role: AccountRole) {
    const query = await Role.query()
      .select('role')
      .where('user_id', userId)
      .where('company_id', companyId)
      .where('role', role)
      .first()

    return query === null ? false : true
  }

  public static async addRole(
    userId: number,
    companyId: number,
    role: AccountRole,
    trx?: TransactionClientContract
  ): Promise<boolean> {
    if (await Role.hasRole(userId, companyId, role)) {
      return false
    }
    const entity = new Role()

    if (trx) {
      entity.useTransaction(trx)
    }

    entity.userId = userId
    entity.companyId = companyId
    entity.role = role
    await entity.save()

    return entity.$isPersisted
  }

  public static async deleteRole(
    userId: number,
    companyId: number,
    trx?: TransactionClientContract
  ): Promise<boolean> {
    const role = await Role.query().where('user_id', userId).where('company_id', companyId).first()

    if (role === null) {
      return false
    }

    if (trx) {
      role.useTransaction(trx)
    }

    await role.delete()

    return role.$isDeleted
  }

  public static async switchRole(
    userId: number,
    companyId: number,
    nextRole: AccountRole,
    trx?: TransactionClientContract
  ): Promise<boolean> {
    const role = await Role.query()
      .select('id')
      .where('user_id', userId)
      .where('company_id', companyId)
      .first()

    if (role === null) {
      return false
    }

    if (trx) {
      role.useTransaction(trx)
    }

    await role.delete()

    if (!role.$isDeleted) {
      return false
    }

    const res = await Role.addRole(userId, companyId, nextRole, trx)

    return res
  }

  public static async companies(userId: number) {
    const rows = await Role.query()
      .distinct('roles.company_id')
      .select('companies.id', 'companies.name')
      .join('companies', 'roles.company_id', 'companies.id')
      .where('roles.user_id', userId)
      .pojo<{ company_id: number }>()

    return rows.map((r) => r.company_id)
  }

  public static async userNames(companyId: number) {
    return await Role.query()
      .select('users.id', 'users.first_name', 'users.last_name')
      .join('users', 'roles.user_id', 'users.id')
      .where('roles.company_id', companyId)
      .orderBy('users.first_name', 'asc')
      .orderBy('users.last_name', 'asc')
  }

  public static async userIds(companyId: number) {
    const roles = await Role.query()
      .select('user_id')
      .where('company_id', companyId)
      .pojo<{ user_id: number }>()

    return roles.map((r) => r.user_id)
  }
}
