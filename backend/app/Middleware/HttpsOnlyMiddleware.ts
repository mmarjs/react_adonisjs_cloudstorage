import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class HttpsOnlyMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    if (['staging', 'production'].includes(Env.get('NODE_ENV'))) {
      if (request.header('x-forwarded-proto') !== 'https') {
        return response.httpVersionNotSupported()
      }
    }

    await next()
  }
}
