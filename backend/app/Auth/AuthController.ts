import Auth from 'App/Auth/Auth'
import Company from 'App/Models/Company'
import User from 'App/Models/User'
import Pusher from 'App/Lib/Pusher'
import sendPasswordReset from 'App/Auth/SendPasswordReset'
import resetPassword from 'App/Auth/ResetPassword'
import handleLogin from 'App/Auth/HandleLogin'
import handleShareLogin from 'App/Auth/HandleShareLogin'
import LoginData from 'App/Auth/LoginData'
import {
  LoginValidator,
  SendPasswordResetValidator,
  ResetPasswordValidator,
  ShareLoginValidator,
  SwitchCompanyValidator,
} from 'App/Auth/Validators'
import { getCompanyUserIdsByToken, isShareLinkUser } from 'App/Lib/Helpers'
import { ResetPasswordBody, LoginInput, ShareLoginInput } from 'App/types'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  /**
   * GET /auth_status
   */
  public async status({ request, response }: HttpContextContract) {
    const token = request.header('token')

    if (token === undefined) {
      return response.unprocessableEntity({ error: 'token-type-error' })
    }

    try {
      const auth = new Auth(token)
      const res = await auth.check()
      await auth.refreshTtl()

      if (!res) {
        return response.badRequest({ error: 'invalid-token' })
      }

      return response.ok({ status: 'ok' })
    } catch (err) {
      return response.badRequest({ error: 'failed-to-check-status' })
    }
  }

  /**
   * POST /login
   */
  public async login({ request, response }: HttpContextContract) {
    await request.validate(LoginValidator)
    const params = request.all() as LoginInput

    const { error, success } = await handleLogin(params)

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok(success)
  }

  /**
   *
   * POST /share_login
   */
  public async shareLogin({ request, response }: HttpContextContract) {
    await request.validate(ShareLoginValidator)
    const params = request.all() as ShareLoginInput

    const { error, success } = await handleShareLogin(params)

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok(success)
  }

  /**
   * POST /logout
   */
  public async logout({ request, response }: HttpContextContract) {
    const token = request.header('token')

    if (token === undefined) {
      return response.badRequest({ error: 'no-token' })
    }

    try {
      const auth = new Auth(token)
      await auth.delete()
      return response.ok({ status: 'ok' })
    } catch (err) {
      return response.badRequest({ error: 'failed-to-delete-token' })
    }
  }

  /**
   * POST /send_password_reset
   */
  public async sendPasswordReset({ request, response }: HttpContextContract) {
    await request.validate(SendPasswordResetValidator)
    const { email } = request.only(['email'])

    const { error, success } = await sendPasswordReset(email)

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ success })
  }

  /**
   * POST /reset_password
   */
  public async resetPassword({ request, response }: HttpContextContract) {
    await request.validate(ResetPasswordValidator)
    const body = request.all() as ResetPasswordBody

    const { error, success } = await resetPassword(body)

    if (error !== null) {
      return response.badRequest({ error })
    }

    return response.ok({ success })
  }

  /**
   * POST /switch_company
   */
  public async switchCompany({ request, response, token }: HttpContextContract) {
    await request.validate(SwitchCompanyValidator)

    const { companyId } = request.only(['companyId']) as { companyId: number }

    const auth = new Auth(token)
    const res = await auth.switchCompany(companyId)

    if (!res) {
      return response.badRequest({ error: 'not-able-to-switch-company' })
    }

    const { userId } = await getCompanyUserIdsByToken(token)
    const company = await Company.findOrFail(companyId)

    const loginData = new LoginData(userId, company, token)
    const data = await loginData.prepare()

    return response.ok(data)
  }

  public async pusher({ request, response, token }: HttpContextContract) {
    if (await isShareLinkUser(token)) {
      return response.unprocessableEntity({ error: 'cannot-notify-share-users' })
    }

    const { userId, companyId } = await getCompanyUserIdsByToken(token)
    const socketId = request.body['socket_id'] as string
    const channel = request.body['channel_name'] as string

    if (typeof socketId !== 'string' || typeof channel !== 'string') {
      return response.unprocessableEntity({ error: 'invalid-input' })
    }

    const user = await User.query()
      .select('channel')
      .where({ id: userId })
      .pojo<{ channel: string }>()
      .reporterData({ name: 'AuthController.pusher get user channel' })
      .firstOrFail()

    const company = await Company.query()
      .select('channel')
      .where({ id: companyId })
      .pojo<{ channel: string }>()
      .reporterData({ name: 'AuthController.pusher get company channel' })
      .firstOrFail()

    const userChannel = `private-${user.channel}-${company.channel}`

    if (channel !== userChannel) {
      return response.unprocessableEntity({ error: 'invalid-channel' })
    }

    const authorization = Pusher.authenticate(socketId, channel)
    return response.ok(authorization)
  }
}
