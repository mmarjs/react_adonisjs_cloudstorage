import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class TwoFactorLoginValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    two_factor_token: schema.string(),
  })

  public messages = {
    'two_factor_token.required:': 'An two factor token is required',
  }
}

export class SendPasswordResetValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    email: schema.string({
      trim: true,
    }),
  })

  public messages = {
    'email.required:': 'An email address is required',
  }
}

export class ResetPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    token: schema.string(),
    password: schema.string({}, [rules.minLength(8), rules.confirmed()]),
    password_confirmation: schema.string(),
  })

  public messages = {
    'token': 'A reset token is required',
    'password.required:': 'A password is required',
    'password_confirmation': 'A password confirmation is required',
    'password.minLength': 'A password must be at least 8 characters',
    'password.confirmed': 'The password and confirmation do not match',
  }
}

export class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    action: schema.enum(
      ['validate-login', 'need-two-factor', 'verify-two-factor', 'fetch-login-data'] as const,
      [rules.required()]
    ),
    email: schema.string.optional({ trim: true }, [
      rules.requiredWhen('action', 'in', ['validate-login']),
    ]),
    password: schema.string.optional({ trim: true }, [
      rules.requiredWhen('action', '=', 'validate-login'),
    ]),
    userId: schema.number.optional([
      rules.requiredWhen('action', 'in', [
        'need-two-factor',
        'verify-two-factor',
        'fetch-login-data',
      ]),
    ]),
    companyId: schema.number.optional([
      rules.requiredWhen('action', 'in', [
        'need-two-factor',
        'verify-two-factor',
        'fetch-login-data',
      ]),
    ]),
    loginProcessToken: schema.string.optional({}, [
      rules.requiredWhen('action', 'in', [
        'need-two-factor',
        'verify-two-factor',
        'fetch-login-data',
      ]),
    ]),
    twoFactorToken: schema.string.optional({}, [
      rules.requiredWhen('action', '=', 'verify-two-factor'),
    ]),
  })

  public messages = {
    'action.required': 'A login action is required',
    'email.required:': 'An email address is required',
    'email.requiredWhen': 'An email address is required',
    'pasword.required': 'A password is required',
    'password.requiredWhen': 'A password is required',
    'userId.required': 'A userId is required',
    'userId.requiredWhen': 'A userId is required',
    'companyId.required': 'A companyId is required',
    'companyId.requiredWhen': 'A companyId is required',
    'loginProcessToken.required': 'A login process token is required',
    'loginProcessToken.requiredWhen': 'A login process token is required',
    'twoFactorToken.required': 'A two factor token is required',
    'twoFactorToken.requiredWhen': 'A login process token is required',
  }
}

export class ShareLoginValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    email: schema.string({ trim: true }),
    password: schema.string({ trim: true }),
    link: schema.string({ trim: true }),
    firstName: schema.string.optional(),
    lastName: schema.string.optional(),
    companyName: schema.string.optional(),
    phone: schema.string.optional(),
  })

  public messages = {
    'email.required:': 'An email address is required',
    'pasword.required': 'A password is required',
    'link.required': 'A share link validator is required',
  }
}

export class SwitchCompanyValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    companyId: schema.number(),
  })

  public messages = {
    'companyId.required:': 'A companyId is required',
  }
}
