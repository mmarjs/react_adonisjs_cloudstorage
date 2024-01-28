import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class UpdateNotificationSettingValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    column: schema.enum(['sendApp', 'sendEmail'] as const),
    value: schema.boolean(),
  })

  public messages = {
    'column.required': 'The setting for app notifications is required',
    'value.required': 'The setting for email notifications is required',
  }
}
