import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class AddCaseValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    companyId: schema.number([rules.unsigned()]),
    caseTypeId: schema.number([rules.unsigned()]),
    timeZoneId: schema.number([rules.unsigned()]),
    caseName: schema.string(),
    clientName: schema.string(),
  })

  public messages = {
    'companyId.required': 'An company is required',
    'companyId.unsigned': 'A valid company is required',
    'caseTypeId.required': 'A case type is required',
    'caseTypeId.unsigned': 'A valid case type is required',
    'timeZoneId.required': 'A time zone is required',
    'timeZoneId.unsigned': 'A valid time zone is required',
    'caseName.required:': 'A case name is required',
    'clentName.required': 'A client name is required',
  }
}

export class EditCaseValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    caseTypeId: schema.number([rules.unsigned()]),
    timeZoneId: schema.number([rules.unsigned()]),
    caseName: schema.string(),
    clientName: schema.string(),
    status: schema.enum(['active', 'archive', 'delete'] as const, [rules.required()]),
  })

  public messages = {
    'companyId.unsigned': 'A valid company is required',
    'caseTypeId.required': 'A case type is required',
    'caseTypeId.unsigned': 'A valid case type is required',
    'timeZoneId.required': 'A time zone is required',
    'timeZoneId.unsigned': 'A valid time zone is required',
    'caseName.required:': 'A case name is required',
    'clentName.required': 'A client name is required',
    'status.required': 'A status (active, archived, or delete) is required',
  }
}

export class CaseSearchValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    type: schema.enum(['simple', 'advanced'] as const, [rules.required()]),
    search: schema.string({ trim: true }),
    companyId: schema.number([rules.unsigned()]),
    showArchived: schema.boolean(),
  })

  public messages = {
    'type.required': 'The search type must be simple or advanced',
    'search.required': 'A search body is required',
    'companyId.required': 'A companyId is required',
    'showArchived.required': 'A case status is required',
  }
}

export class CasePermissionValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number([rules.unsigned()]),
    companyId: schema.number([rules.unsigned()]),
    resourceId: schema.number([rules.unsigned()]),
  })

  public messages = {
    'userId.required': 'A user is required',
    'userId.unsigned': 'A valid user is required',
    'companyId.required': 'An company is required',
    'companyId.unsigned': 'A valid company is required',
    'resourceId.required': 'A case is required',
    'resourceId.unsigned': 'A valid case is required',
  }
}
