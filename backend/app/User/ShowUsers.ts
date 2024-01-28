import Company from 'App/Models/Company'
import Database from '@ioc:Adonis/Lucid/Database'
import { ShowUserInfo } from 'App/types'

export default class ShowUsers {
  public companyId: number

  constructor(companyId: number) {
    this.companyId = companyId
  }

  public async show() {
    const users = (await Database.query()
      .from('roles')
      .innerJoin('users', 'users.id', '=', 'roles.user_id')
      .select(
        'users.id',
        'users.email',
        'roles.role',
        'users.first_name',
        'users.last_name',
        'users.status',
        'users.company_name',
        'users.last_login',
        'roles.created_at'
      )
      .where('roles.company_id', this.companyId)
      .whereIn('roles.role', ['account-admin', 'case-manager'])
      .whereNull('users.deleted_at')
      .where('users.status', '!=', 'deleted')
      .union((query) => {
        query
          .from('roles')
          .innerJoin('users', 'users.id', '=', 'roles.user_id')
          .select(
            'users.id',
            'users.email',
            'roles.role',
            'users.first_name',
            'users.last_name',
            'users.status',
            'users.company_name',
            'users.last_login',
            'roles.created_at'
          )
          .where('roles.company_id', this.companyId)
          .whereIn('roles.role', ['client-user'])
          .whereNull('users.deleted_at')
          .where('users.status', '!=', 'deleted')
          .orderBy('role', 'asc')
          .orderBy('last_name', 'asc')
      })) as ShowUserInfo[]

    const employeeInfo = await Company.employeeInfo(this.companyId)

    return { users, employeeInfo }
  }
}
