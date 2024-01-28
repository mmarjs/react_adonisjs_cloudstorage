import cuid from 'cuid'
import Auth from 'App/Auth/Auth'
import User from 'App/Models/User'
import Company from 'App/Models/Company'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import { LoginDataResponse, AccountRole } from 'App/types'
import { DateTime } from 'luxon'
import NotificationSetting from 'App/Models/NotificationSetting'
import Permission from 'App/Models/Permission'

export default class LoginData {
  public userId: number
  public user: User
  public company: Company
  public role: AccountRole
  public hasMultipleCompanies: boolean
  public notifications: Notification[]
  public notificationSettings: NotificationSetting[]
  public permissions: Permission[] = []
  public token?: string

  constructor(userId: number, company: Company, token?: string) {
    this.userId = userId
    this.company = company
    this.token = token
  }

  public async prepare(): Promise<LoginDataResponse> {
    const user = await User.query()
      .select([
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'status',
        'street',
        'city',
        'state',
        'zip',
        'company_name',
        'is_two_factor_required',
        'two_factor_method',
        'channel',
        'created_at',
        'updated_at',
        'last_login',
      ])
      .where('id', this.userId)
      .firstOrFail()

    this.user = user
    const role = await Role.currentRole(user.id, this.company.id)
    this.role = role

    this.user.lastLogin = DateTime.utc()
    await this.user.save()

    const roleCompanies = await Role.companies(this.userId)
    this.hasMultipleCompanies = roleCompanies.length > 1 ? true : false

    this.notifications = await Notification.userNotifications(this.userId, this.company.id, [
      'id',
      'event',
      'message',
      'created_at',
    ])

    this.notificationSettings = await NotificationSetting.byUser(this.userId, this.company.id, [
      'id',
      'event',
      'send_app',
      'send_email',
    ])

    if (!User.adminRoles.includes(role)) {
      this.permissions = await Permission.query()
        .select('action', 'resource', 'resource_id')
        .where({ userId: this.userId })
        .where({ companyId: this.company.id })
    }

    if (User.adminRoles.includes(role)) {
      return await this.accountAdmins()
    }

    if (role === 'case-manager') {
      return await this.caseManager()
    }

    return await this.clientUser()
  }

  public async accountAdmins(): Promise<LoginDataResponse> {
    return {
      user: this.user,
      role: this.role,
      company: this.company,
      token: await this.storeToken(),
      hasMultipleCompanies: this.hasMultipleCompanies,
      notifications: this.notifications,
      notificationSettings: this.notificationSettings,
      permissions: this.permissions,
    }
  }

  public async caseManager(): Promise<LoginDataResponse> {
    await this.user.load('permissions', (query) =>
      query
        .select('id', 'resource_id', 'resource')
        .where('resource', 'case')
        .where('user_id', this.user.id)
        .where('company_id', this.company.id)
    )

    return {
      user: this.user,
      role: this.role,
      company: this.company,
      token: await this.storeToken(),
      hasMultipleCompanies: this.hasMultipleCompanies,
      notifications: this.notifications,
      notificationSettings: this.notificationSettings,
      permissions: this.permissions,
    }
  }

  public async clientUser(): Promise<LoginDataResponse> {
    await this.user.load('permissions', (query) =>
      query
        .select('id', 'resource_id', 'resource')
        .where('resource', 'case')
        .where('user_id', this.user.id)
        .where('company_id', this.company.id)
    )

    return {
      user: this.user,
      role: this.role,
      company: this.company,
      token: await this.storeToken(),
      hasMultipleCompanies: this.hasMultipleCompanies,
      notifications: this.notifications,
      notificationSettings: this.notificationSettings,
      permissions: this.permissions,
    }
  }

  private async storeToken(): Promise<string> {
    if (typeof this.token !== 'undefined') {
      return this.token
    }

    const token = cuid()
    const auth = new Auth(token)
    await auth.store(this.user.id, this.company.id)

    return token
  }
}
