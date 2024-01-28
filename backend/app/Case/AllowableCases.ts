import Role from 'App/Models/Role'
import User from 'App/Models/User'
import Case from 'App/Models/Case'
import Permission from 'App/Models/Permission'
import { PolicyAction, CaseStatus } from 'App/types'

export default class AllowableCases {
  public userId: number
  public companyId: number
  public action: PolicyAction
  public status: CaseStatus[]

  constructor(
    userId: number,
    companyId: number,
    action: PolicyAction,
    status: CaseStatus[] = ['active']
  ) {
    this.userId = userId
    this.companyId = companyId
    this.action = action
    this.status = status
  }

  public async caseIds(): Promise<number[]> {
    const role = await Role.currentRole(this.userId, this.companyId)

    if (User.adminRoles.includes(role)) {
      return await this.caseIdsByCompany()
    }

    return await this.caseIdsByPermissions()
  }

  private async caseIdsByCompany(): Promise<number[]> {
    const cases = await Case.query()
      .select('id')
      .where('company_id', this.companyId)
      .whereIn('status', this.status)
      .whereNull('deleted_at')
      .pojo<{ id: number }>()

    return cases.map((c) => c.id)
  }

  private async caseIdsByPermissions(): Promise<number[]> {
    const cases = await Permission.query()
      .join('cases', 'permissions.resource_id', 'cases.id')
      .select('cases.id')
      .whereNull('cases.deleted_at')
      .whereIn('cases.status', this.status)
      .where('permissions.company_id', this.companyId)
      .where('permissions.user_id', this.userId)
      .where('permissions.resource', 'case')
      .where('permissions.action', this.action)
      .pojo<{ id: number }>()

    return cases.map((c) => c.id)
  }
}
