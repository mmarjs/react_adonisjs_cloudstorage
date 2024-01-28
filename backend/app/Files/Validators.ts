import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class DeleteFileValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    id: schema.number(),
    type: schema.enum(['file', 'folder'] as const, [rules.required()]),
    category: schema.enum(['workgroup', 'personal'] as const, [rules.required()]),
  })

  public messages = {
    'id.required': 'An id is required',
    'type.required': 'A type is required',
    'category.required:': 'A category is requird',
  }
}

export class DownloadFileValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    id: schema.number(),
    resource: schema.enum(['workgroup', 'personal', 'evidence', 'shared'] as const, [
      rules.required(),
    ]),
  })

  public messages = {
    'id.required': 'A resource id is required',
    'resource.required:': 'A category is requird',
  }
}

export class BuildZipValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    resource: schema.enum(['workgroup', 'personal'] as const, [rules.required()]),
    resourceId: schema.number(),
    parentId: schema.number(),
    files: schema.array().members(schema.number()),
    folders: schema.array().members(schema.number()),
  })

  public messages = {
    'resource.required': 'A resource is required',
    'resourceId.required': 'A resource id is required',
    'parentId.required': 'A parentId is required',
    'files.required': 'An array of files is required',
    'folders.required': 'An array of entries is required',
  }
}

export class WasabiTempCredentialsValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    resource: schema.enum(['workgroup', 'personal', 'evidence', 'shared'] as const, [
      rules.required(),
    ]),
    resourceId: schema.number(),
  })

  public messages = {
    'resource.required': 'A resource is required',
    'id.required': 'A resource id is required',
  }
}

export class ActivateFilesValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    folderId: schema.number(),
    resource: schema.enum(['workgroup', 'personal'] as const),
    shareLinkId: schema.number.optional(),
    files: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        resource: schema.enum(['workgroup', 'personal', 'evidence', 'shared'] as const, [
          rules.required(),
        ]),
        folder_id: schema.number(),
        filename: schema.string(),
        size: schema.number(),
        path: schema.string(),
        last_modified: schema.string(),
      })
    ),
  })

  public messages = {
    'files.required': 'An array of files is required',
  }
}
