import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const token = request.header('token') as string

    if (!token) {
      return response.unprocessableEntity({ error: 'no-upload-authorization' })
    }

    await next()
  }
}
