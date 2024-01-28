import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class CreatePersonalFolderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    parentId: schema.number(),
    name: schema.string(),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'parentId.required': 'A parent folder id is required',
    'name.required': 'A folder name is required',
  }
}

export class PersonalDirectoryValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    folderId: schema.number(),
    status: schema.enum(['pending', 'active', 'updating', 'trashed', 'transferred'] as const, [
      rules.required(),
    ]),
  })

  public messages = {
    'folderId.required': 'A folder id is required',
    'status.required': 'A folder status is required',
  }
}

export class MovePersonalFolderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    folderId: schema.number(),
    newParentId: schema.number(),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'newParentId.required': 'A new parent id is required',
  }
}

export class MovePersonalFilesValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    fileIds: schema.array().members(schema.number()),
    nextFolderId: schema.number(),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'fileIds.required': 'A list of file ids are required',
    'nextFolderId.required': 'A new folder id is required',
  }
}

export class RenamePersonalFolderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    folderId: schema.number(),
    name: schema.string(),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'name.required': 'A new folder name is required',
  }
}

export class RenamePersonalFileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    fileId: schema.number(),
    name: schema.string(),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'fileId.required': 'A file id is required',
    'name.required': 'A new file name is required',
  }
}

export class UpdatePersonalFolderStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    folderId: schema.number(),
    status: schema.enum(['pending', 'active', 'updating', 'trashed'] as const, [rules.required()]),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'status.required': 'You must sumbit a valid status',
  }
}

export class UpdatePersonalFileStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    fileIds: schema.array().members(schema.number()),
    status: schema.enum(['pending', 'active', 'updating', 'trashed'] as const, [rules.required()]),
  })

  public messages = {
    'fileIds.required': 'A list of files to update is required',
    'status.required': 'You must sumbit a valid status',
  }
}
