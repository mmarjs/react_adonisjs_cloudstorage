import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import { PolicyResource, PolicyAction, AccountRole } from 'App/types'

export default class Authorization {
  public userId: number
  public companyId: number
  public action: PolicyAction
  public resource: PolicyResource
  public resourceId?: number

  constructor(
    userId: number,
    companyId: number,
    action: PolicyAction,
    resource: PolicyResource,
    resourceId?: number
  ) {
    this.userId = userId
    this.companyId = companyId
    this.action = action
    this.resource = resource
    this.resourceId = resourceId
  }

  public async isAuthorized(): Promise<boolean> {
    const role = await Role.currentRole(this.userId, this.companyId)

    if (User.adminRoles.includes(role)) {
      return true
    }

    if (this.resourceId === undefined) {
      return this.defaultAuthorization(role)
    }

    const permission = await Permission.query()
      .select('id')
      .withScopes((scope) =>
        scope.byResourceActionId(
          this.userId,
          this.companyId,
          this.action,
          this.resource,
          this.resourceId as number
        )
      )
      .first()

    if (permission === null) {
      return false
    }

    return true
  }

  public defaultAuthorization(role: AccountRole): boolean {
    if (role === 'client-user') {
      return false
    }

    if (role === 'evidence-user') {
      return false
    }

    const opts = this.caseManagerDefault()
    return Boolean(opts.get(`${this.action}|${this.resource}`))
  }

  public caseManagerDefault() {
    const caseDefault = new Map<string, boolean>()
    caseDefault.set('read|case', true)
    caseDefault.set('write|case', false)
    caseDefault.set('create|case', true)
    caseDefault.set('trash|case', false)
    caseDefault.set('grant|case', false)

    caseDefault.set('read|user', false)
    caseDefault.set('write|user', false)
    caseDefault.set('create|user', false)
    caseDefault.set('trash|user', false)
    caseDefault.set('grant|user', false)

    caseDefault.set('read|custodian', false)
    caseDefault.set('write|custodian', false)
    caseDefault.set('create|custodian', false)
    caseDefault.set('trash|custodian', false)
    caseDefault.set('grant|custodian', false)

    caseDefault.set('read|evidence', false)
    caseDefault.set('write|evidence', false)
    caseDefault.set('create|evidence', false)
    caseDefault.set('trash|evidence', false)
    caseDefault.set('grant|evidence', false)

    return caseDefault
  }
}
