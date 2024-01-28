import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class UpdatePreferenceValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    option: schema.boolean(),
  })

  public messages = {
    'option.required': 'An selection is required',
  }
}
