import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Case from 'App/Models/Case'
import AllowableCases from 'App/Case/AllowableCases'
import { DashboardData, AccountRole } from 'App/types'

export default class Dashboard {
  public userId: number
  public companyId: number
  public role: AccountRole
  public activeCaseIds: number[]
  public archivedCaseIds: number[]

  constructor(userId: number, companyId: number) {
    this.userId = userId
    this.companyId = companyId
  }

  public async getData(): Promise<DashboardData> {
    this.role = await Role.currentRole(this.userId, this.companyId)
    let allowable = new AllowableCases(this.userId, this.companyId, 'read', ['active'])
    this.activeCaseIds = await allowable.caseIds()

    allowable = new AllowableCases(this.userId, this.companyId, 'read', ['archived'])
    this.archivedCaseIds = await allowable.caseIds()

    if (User.adminRoles.includes(this.role)) {
      return await this.admins()
    }

    if (this.role === 'case-manager') {
      return await this.caseManager()
    }

    return await this.clientUser()
  }

  private async admins(): Promise<DashboardData> {
    let userIds = await Role.userIds(this.companyId)

    if (this.role === 'account-owner') {
      userIds = userIds.filter((f) => f !== this.userId)
    }

    const activeSize = await Case.totalFileSize(this.activeCaseIds, 'active')
    const archiveSize = await Case.totalFileSize(this.archivedCaseIds, 'active')

    return {
      userCount: userIds.length ?? 0,
      caseCount: this.activeCaseIds.length + this.archivedCaseIds.length,
      custodianCount: 0,
      requestCount: 0,
      activeLockerCount: activeSize,
      archiveLockerCount: archiveSize,
      currentBillable: 0,
      companyTotalFileSizes: activeSize + archiveSize,
    }
  }

  private async caseManager(): Promise<DashboardData> {
    const activeSize = await Case.totalFileSize(this.activeCaseIds, 'active')
    const archiveSize = await Case.totalFileSize(this.archivedCaseIds, 'active')

    return {
      userCount: 0,
      caseCount: this.activeCaseIds.length + this.archivedCaseIds.length,
      custodianCount: 0,
      requestCount: 0,
      activeLockerCount: activeSize,
      archiveLockerCount: archiveSize,
      currentBillable: 0,
      companyTotalFileSizes: activeSize + archiveSize,
    }
  }

  private async clientUser(): Promise<DashboardData> {
    const activeSize = await Case.totalFileSize(this.activeCaseIds, 'active')
    const archiveSize = await Case.totalFileSize(this.archivedCaseIds, 'active')

    return {
      userCount: 0,
      caseCount: this.activeCaseIds.length + this.archivedCaseIds.length,
      custodianCount: 0,
      requestCount: 0,
      activeLockerCount: activeSize,
      archiveLockerCount: archiveSize,
      currentBillable: 0,
      companyTotalFileSizes: activeSize + archiveSize,
    }
  }
}
