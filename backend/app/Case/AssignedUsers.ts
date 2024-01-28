import Database from '@ioc:Adonis/Lucid/Database'
import { AssignedUser } from 'App/types'

export default class AssignedUsers {
  public userId: number
  public companyId: number
  public caseId: number

  constructor(userId: number, companyId: number, caseId: number) {
    this.userId = userId
    this.companyId = companyId
    this.caseId = caseId
  }

  public async getData() {
    const admins = await this.getAdmins()
    const users = await this.getUsers()
    const combined = users.concat(admins)
    const available = await this.getAvailableUsers()

    return { users: combined, available }
  }

  public async getAdmins() {
    return (await Database.query()
      .from('roles')
      .select(
        'roles.user_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.last_login',
        'roles.role'
      )
      .join('users', 'roles.user_id', 'users.id')
      .whereIn('roles.role', ['account-admin'])
      .where('roles.user_id', '!=', this.userId)
      .where('roles.company_id', this.companyId)) as unknown as AssignedUser[]
  }

  public async getUsers() {
    return (await Database.query()
      .from('roles')
      .select(
        'roles.user_id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'roles.role',
        'users.last_login'
      )
      .join('users', 'roles.user_id', 'users.id')
      .whereIn('roles.role', ['case-manager', 'client-user'])
      .where('roles.company_id', this.companyId)
      .where('roles.user_id', '!=', this.userId)
      .whereExists((query) => {
        query
          .from('permissions')
          .whereColumn('permissions.user_id', 'roles.user_id')
          .where('permissions.resource', 'case')
          .where('permissions.resource_id', this.caseId)
      })

      .orderBy('roles.role', 'asc')) as unknown as AssignedUser[]
  }

  public async getAvailableUsers() {
    return (await Database.query()
      .from('roles')
      .select(
        'roles.user_id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'roles.role',
        'users.last_login'
      )
      .join('users', 'roles.user_id', 'users.id')
      .whereIn('roles.role', ['case-manager', 'client-user'])
      .where('roles.company_id', this.companyId)
      .whereNotExists((query) => {
        query
          .from('permissions')
          .whereColumn('permissions.user_id', 'roles.user_id')
          .where('permissions.resource', 'case')
          .where('permissions.resource_id', this.caseId)
      })

      .orderBy('roles.role', 'asc')) as unknown as AssignedUser[]
  }
}
