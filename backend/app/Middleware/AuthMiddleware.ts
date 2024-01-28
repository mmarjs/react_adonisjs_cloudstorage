import Auth from 'App/Auth/Auth'
import Debug from 'debug'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const debug = Debug('auth:middleware')

    const { request, response } = ctx
    const token = request.header('token') ?? (request.qs()?.token as string | undefined)

    if (token === null || token === undefined || token.length === 0 || typeof token !== 'string') {
      debug('no access token')
      return response.unauthorized({ error: 'no-access-token' })
    }

    const auth = new Auth(token)

    try {
      const isValid = await auth.check()

      if (isValid) {
        debug(`valid token: ${token}`)

        if (await auth.isAboutToExpire()) {
          await auth.refreshTtl()
        }

        ctx.token = token
        return next()
      } else {
        debug(`invalid token: ${token}`)
        return response.status(401).json({ error: 'invalid-access-token' })
      }
    } catch (err) {
      if (err?.message === 'wrong-auth-category') {
        return response.unauthorized({ error: 'wrong-auth-category' })
      }

      if (err?.message === 'cannot-fetch-token') {
        return response.unauthorized({ error: 'cannot-fetch-token' })
      }

      return response.unauthorized({ error: 'invalid-access-token' })
    }
  }
}
