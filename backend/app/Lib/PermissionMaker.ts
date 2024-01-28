import Permission from 'App/Models/Permission'
import { PolicyAction, PolicyResource } from 'App/types'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export default class PermissionMaker {
  public userId: number
  public companyId: number

  constructor(userId: number, companyId: number) {
    this.userId = userId
    this.companyId = companyId
  }

  public static async make(
    userId: number,
    companyId: number,
    resourceId: number,
    resource: PolicyResource,
    actions: PolicyAction[],
    trx?: TransactionClientContract
  ) {
    for (let action of actions) {
      await Permission.addPermission(userId, companyId, action, resource, resourceId, trx)
    }
  }
}
