import User from 'App/Models/User'
import Role from 'App/Models/Role'
import State from 'App/Models/State'
import Permission from 'App/Models/Permission'
import { Either, ShowUserResponse, ShowUserUser, ShowUserCase, ShowUserState } from 'App/types'

export default class ShowUser {
  public userId: number
  public companyId: number

  constructor(userId: number, companyId: number) {
    this.userId = userId
    this.companyId = companyId
  }

  public async show(): Promise<Either<ShowUserResponse>> {
    const user = await User.query()
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'company_name',
        'street',
        'city',
        'state',
        'zip',
        'phone',
        'status'
      )
      .where('id', this.userId)
      .pojo<ShowUserUser>()
      .first()

    if (user === null) {
      return { error: 'invalid-user' }
    }

    const role = await Role.currentRole(this.userId, this.companyId)

    const cases = await Permission.query()
      .join('cases', 'permissions.resource_id', 'cases.id')
      .select('cases.id', 'cases.case_name', 'cases.client_name', 'cases.client_reference')
      .where('permissions.company_id', this.companyId)
      .where('permissions.user_id', this.userId)
      .where('permissions.resource', 'case')
      .where('permissions.action', 'read')
      .pojo<ShowUserCase>()

    const states = await State.query()
      .select(['id', 'name'])
      .orderBy('name', 'asc')
      .pojo<ShowUserState>()

    return { error: null, success: { user, role, cases, states } }
  }
}
