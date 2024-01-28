import Case from 'App/Models/Case'
import State from 'App/Models/State'
import Company from 'App/Models/Company'
import ShowUser from 'App/User/ShowUser'
import ShowUsers from 'App/User/ShowUsers'
import Invitation from 'App/User/Invitation'
import ProfileUpdater from 'App/User/ProfileUpdater'
import UserVerification from 'App/User/UserVerification'
import AccountUserUpdater from 'App/User/AccountUserUpdater'
import AccountRegistration from 'App/User/AccountRegistration'
import AccountOwnerVerification from 'App/User/AccountOwnerVerification'
import Authorization from 'App/Auth/Authorization'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getCompanyUserIdsByToken, getCompanyByToken } from 'App/Lib/Helpers'
import {
  RegisterValidator,
  StoreUserInvitationValidator,
  VerifyAccountOwnerValidator,
  VerifyUserValidator,
  UpdateAccountUserValidator,
  UpdateUserProfileValidator,
} from 'App/User/Validators'
import {
  RegisterAccountOwnerInput,
  UserInvitationBody,
  AcceptInvitationBody,
  UpdateUserProfile,
  UpdateAccountUser,
} from 'App/types'

export default class UserController {
  /**
   * GET /users
   */
  public async index({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'read', 'user')
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'no-authorization' })
    }

    const showUsers = new ShowUsers(companyId)
    const result = await showUsers.show()

    if (!result) {
      return response.badRequest('could not fetch users')
    }

    return response.ok(result)
  }

  /**
   * GET /users/reqs
   */
  public async reqs({ response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const company = await getCompanyByToken(token)

    const authorization = new Authorization(userId, companyId, 'create', 'user')

    if (!(await authorization.isAuthorized())) {
      return response.forbidden({ error: 'no-authorization' })
    }

    const cases = await Case.query()
      .select(['id', 'case_name', 'client_name', 'client_reference'])
      .where('company_id', company.id)
      .where('status', 'active')
      .orderBy('case_name', 'asc')

    const states = await State.query().select(['id', 'name']).orderBy('name', 'asc')

    return response.ok({ cases, states })
  }

  /**
   * GET /users/:id/show
   */
  public async show({ request, response, token }: HttpContextContract) {
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const authorization = new Authorization(userId, companyId, 'write', 'user')
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'no-authorization' })
    }

    const targetUserId = Number(request.param('id'))
    const showUser = new ShowUser(targetUserId, companyId)
    const { error, success } = await showUser.show()

    if (error !== null) {
      return response.badRequest(error)
    }

    return response.ok(success)
  }

  /**
   * POST /register
   */
  public async registerAccount({ request, response }: HttpContextContract) {
    await request.validate(RegisterValidator)
    const input: RegisterAccountOwnerInput = request.all() as RegisterAccountOwnerInput

    const account = new AccountRegistration(input)
    const { error, success } = await account.register()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ status: success })
  }

  /**
   *
   * POST /verify_account
   */
  public async verifyAccountOwner({ request, response }: HttpContextContract) {
    await request.validate(VerifyAccountOwnerValidator)

    const { token } = request.only(['token']) as { token: string }

    const verification = new AccountOwnerVerification(token)
    const { error, success } = await verification.verify()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ success })
  }

  /**
   * POST /users/invite
   */
  public async inviteUser({ request, response, token }: HttpContextContract) {
    await request.validate(StoreUserInvitationValidator)
    const data: UserInvitationBody = request.all() as UserInvitationBody
    const { userId, companyId } = await getCompanyUserIdsByToken(token)

    const company = await Company.find(data.company_id)

    if (company === null) {
      return { error: 'company-does-not-exist' }
    }

    const authorization = new Authorization(userId, companyId, 'create', 'user')
    const isAuthorized = await authorization.isAuthorized()

    if (!isAuthorized) {
      return response.forbidden({ error: 'no-authorization' })
    }

    const invitation = new Invitation(data, { userId, companyId }, company)
    const { error, success } = await invitation.invite()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ status: success })
  }

  /**
   * POST /verify_user
   */
  public async verifyUser({ request, response }: HttpContextContract) {
    await request.validate(VerifyUserValidator)
    const { code, password } = request.all() as AcceptInvitationBody

    const verification = new UserVerification(code, password)

    const { error, success } = await verification.verify()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ success })
  }

  /**
   * PUT /users/:id/update_profile
   */
  public async updateProfile({ request, response }: HttpContextContract) {
    await request.validate(UpdateUserProfileValidator)

    const userId = request.param('id')

    const body = request.all() as UpdateUserProfile

    const updater = new ProfileUpdater(userId, body)
    const { error, success } = await updater.update()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok(success)
  }

  /**
   * PUT /users/:id/update_account
   */
  public async updateAccount({ request, response, token }: HttpContextContract) {
    await request.validate(UpdateAccountUserValidator)
    const userId = request.param('id')

    const { userId: actorId, companyId } = await getCompanyUserIdsByToken(token)

    const body = request.all() as UpdateAccountUser

    const updater = new AccountUserUpdater(userId, companyId, actorId, body)
    const { error } = await updater.update()

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ status: 'ok' })
  }
}
