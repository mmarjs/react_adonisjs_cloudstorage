import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, scope } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { PolicyResource, PolicyAction, AssignedUserCount } from 'App/types'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public companyId: number

  @column()
  public action: PolicyAction

  @column()
  public resourceId: number

  @column()
  public resource: PolicyResource

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  public static actions: PolicyAction[] = ['read', 'write', 'create', 'grant', 'trash']

  public static byResource = scope(
    (query, userId: number, companyId: number, resource: PolicyResource) => {
      query.where('user_id', userId).where('company_id', companyId).where('resource', resource)
    }
  )

  public static byResourceAction = scope(
    (query, userId: number, companyId: number, action: PolicyAction, resource: PolicyResource) => {
      query
        .where('user_id', userId)
        .where('company_id', companyId)
        .where('action', action)
        .where('resource', resource)
    }
  )

  public static byResourceActionId = scope(
    (
      query,
      userId: number,
      companyId: number,
      action: PolicyAction,
      resource: PolicyResource,
      resourceId: number
    ) => {
      query
        .where('user_id', userId)
        .where('company_id', companyId)
        .where('action', action)
        .where('resource', resource)
        .where('resource_id', resourceId)
    }
  )

  public static byResourceId = scope(
    (query, userId: number, companyId: number, resource: PolicyResource, resourceId: number) => {
      query
        .where('user_id', userId)
        .where('company_id', companyId)
        .where('resource', resource)
        .where('resource_id', resourceId)
    }
  )

  public static async addPermission(
    userId: number,
    companyId: number,
    action: PolicyAction,
    resource: PolicyResource,
    resourceId: number,
    trx?: TransactionClientContract
  ): Promise<null | number> {
    const permission = new Permission()
    if (trx) {
      permission.useTransaction(trx)
    }
    permission.companyId = companyId
    permission.userId = userId
    permission.action = action
    permission.resource = resource
    permission.resourceId = resourceId

    await permission.save()

    if (!permission.$isPersisted) {
      return null
    }

    return permission.id
  }

  public static async removePermission(
    userId: number,
    companyId: number,
    resource: PolicyResource,
    resourceId: number = 0,
    trx?: TransactionClientContract
  ): Promise<boolean> {
    const count = await Permission.query()
      .select('id')
      .withScopes((scope) => scope.byResource(userId, companyId, resource))

    let res: any[] = []

    if (resourceId === 0) {
      res = await Permission.query({ client: trx })
        .withScopes((scope) => scope.byResource(userId, companyId, resource))
        .delete()
        .limit(count.length)
    } else {
      res = await Permission.query({ client: trx })
        .withScopes((scope) => scope.byResourceId(userId, companyId, resource, resourceId))
        .delete()
        .limit(count.length)
    }

    if (count.length > 0 && res[0] === 0) {
      return false
    }

    return true
  }

  public static async removePermissions(
    userId: number,
    companyId: number,
    resource: PolicyResource,
    trx?: TransactionClientContract
  ): Promise<boolean> {
    const count = await Permission.query({ client: trx })
      .where({ userId })
      .where({ companyId })
      .where({ resource })
      .count('id as total')
      .pojo<{ total: number }>()
      .first()

    const roles = await Permission.query({ client: trx })
      .where({ userId })
      .where({ companyId })
      .where({ resource })
      .delete()
      .limit(count?.total ?? 0)

    return count?.total === roles[0]
  }

  public static async assignedUserCount(companyId: number) {
    return await Permission.query()
      .select('resource_id AS caseId')
      .countDistinct('user_id AS userNumber')
      .where('resource', 'case')
      .where('company_id', companyId)
      .groupBy('caseId')
      .pojo<AssignedUserCount>()
  }

  public static async hasAny(
    userId: number,
    companyId: number,
    resource: PolicyResource
  ): Promise<boolean> {
    const perm = await Permission.query()
      .count('id as total')
      .where({ userId })
      .where({ companyId })
      .where({ resource })
      .pojo<{ total: number }>()
      .first()

    return (perm?.total ?? 0) > 0
  }
}
