import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class SignUrlValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    filenames: schema.array().members(schema.string()),
  })

  public messages = {
    'filenames.required:': 'At least one url to sign is required',
  }
}

export class CreatePendingFileValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    filename: schema.string(),
    category: schema.enum(['workgroup', 'personal', 'evidence', 'shared'] as const, [
      rules.required(),
    ]),
    category_id: schema.number(),
    folder_id: schema.number(),
    size: schema.number(),
    access: schema.enum(['private', 'shared'] as const, [rules.required()]),
    last_modified: schema.string(),
  })

  public messages = {
    'filename.required:': 'A filename is required',
    'category.required': 'A category is required',
    'category_id.required': 'A category id is required',
    'folder_id.required': 'A folder id is required',
    'size.required': 'File size is required',
    'access.required': 'An access type is required',
    'last_modified.required': 'A last_modified date is required',
  }
}

export class ActivateFileValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    category: schema.enum(['workgroup', 'personal', 'evidence', 'shared'] as const, [
      rules.required(),
    ]),
    file_id: schema.number(),
  })

  public messages = {
    'category.required': 'A category is required',
    'file_id.required': 'A file id is required',
  }
}
