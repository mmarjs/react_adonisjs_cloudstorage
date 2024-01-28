import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    first_name: schema.string(),
    last_name: schema.string(),
    email: schema.string({}, [
      rules.email({}),
      rules.unique({
        table: 'users',
        column: 'email',
      }),
    ]),
    password: schema.string(),
    account_name: schema.string({ trim: true }),
  })

  public messages = {
    'first_name': 'Your first name is required.',
    'last_name': 'Your last name is required.',
    'email.required': 'You must provide a email address.',
    'email.email': 'You must provide a valid email address.',
    'email.unique': 'You must provide a valid email address.',
    'password.required:': 'A password is required',
    'account_name.required': 'An account name is required',
  }
}

export class VerifyUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    code: schema.string({ trim: true }),
    password: schema.string(),
  })

  public messages = {
    'code.required': 'An invitation code is required',
    'code.exists': 'An invitation code must exist',
    'password.required': 'A password is required',
  }
}

export class VerifyAccountOwnerValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    token: schema.string(),
  })

  public messages = {
    'token.required': 'A verification token is required',
  }
}

export class StoreUserInvitationValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    company_id: schema.number(),
    first_name: schema.string(),
    last_name: schema.string(),
    company_name: schema.string.optional(),
    street: schema.string.optional(),
    state: schema.string.optional(),
    zip: schema.number.optional(),
    phone: schema.string.optional(),
    email: schema.string({}, [rules.email()]),
    role: schema.enum(['account-admin', 'case-manager', 'client-user'] as const),
    permitted_cases: schema.array().anyMembers(),
  })

  public messages = {
    'company_id.required': 'A company id is required',
    'first_name.required': 'A first name is required',
    'last_name.required': 'A last name is required',
    'email.required': 'An email is required',
    'role.required': 'A user role is required',
  }
}

export class UpdateAccountUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum(['invited', 'active', 'suspended', 'deleted'] as const, [rules.required()]),
    first_name: schema.string.optional(),
    last_name: schema.string.optional(),
    email: schema.string.optional({ trim: true }, [rules.email()]),
    password: schema.string.optional({}, [rules.minLength(8)]),
    phone: schema.string.optional({ trim: true }),
    street: schema.string.optional({ trim: true }),
    city: schema.string.optional({ trim: true }),
    state: schema.string.optional({ trim: true }),
    zip: schema.number.optional(),
    company_name: schema.string.optional({ trim: true }),
    role: schema.enum.optional(['account-admin', 'case-manager', 'client-user'] as const),
    permitted_cases: schema.array().anyMembers(),
  })

  public messages = {
    'status.required': 'You must submit a status',
  }
}

export class UpdateUserProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    role: schema.enum.optional(['account-admin', 'case-manager', 'client-user'] as const),
    first_name: schema.string.optional(),
    last_name: schema.string.optional(),
    email: schema.string.optional({ trim: true }, [rules.email()]),
    password: schema.string.optional({}, [rules.minLength(8)]),
    phone: schema.string.optional({ trim: true }),
    street: schema.string.optional({ trim: true }),
    city: schema.string.optional({ trim: true }),
    state: schema.string.optional({ trim: true }),
    zip: schema.number.optional(),
    company_name: schema.string.optional({ trim: true }),
    isTwoFactorRequired: schema.boolean.optional(),
    twoFactorMethod: schema.enum.optional(['email']),
  })
}
