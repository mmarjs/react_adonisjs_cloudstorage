import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class CreateShareLinkValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email({})]),
    password: schema.string({ trim: true }),
    identifier: schema.string({ trim: true }),
    subject: schema.string({ trim: true, escape: true }, [rules.maxLength(80)]),
    message: schema.string.optional({ trim: true, escape: true }, [rules.maxLength(240)]),
    expiresAt: schema.string.optional(),
    shareType: schema.enum(['upload', 'download'] as const, [rules.required()]),
    resource: schema.enum(['work_group', 'personal'] as const, [rules.required()]),
    folderId: schema.number(),
    canTrash: schema.boolean.optional(),
    canUpdatePassword: schema.boolean.optional(),
    resend: schema.boolean.optional(),
    items: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        resource: schema.enum([
          'work_group_folders',
          'work_group_files',
          'personal_folders',
          'personal_files',
        ] as const),
        resourceId: schema.number(),
      })
    ),
  })
}

export class UpdateShareLinkValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    expiry: schema.string.optional(),
    password: schema.string.optional(),
  })
}

export class StoreSharedLinkInfoValidator {
  constructor(protected ctx: HttpContextContract) {}
  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    firstName: schema.string.optional(),
    lastName: schema.string.optional(),
    companyName: schema.string.optional(),
    phone: schema.string.optional(),
  })
}

export class CreateSharedPersonalFolderValidator {
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

export class UpdateSharedPersonalFolderStatusValidator {
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

export class UpdateSharedPersonalFileStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    userId: schema.number(),
    folderId: schema.number(),
    fileIds: schema.array().members(schema.number()),
    method: schema.enum(['id', 'folder'] as const, [rules.required()]),
    status: schema.enum(['pending', 'active', 'updating', 'trashed'] as const, [rules.required()]),
  })

  public messages = {
    'userId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'fileIds.required': 'A list of files to update is required',
    'method.required': 'The type of method to update by is required',
    'status.required': 'You must sumbit a valid status',
  }
}

export class CreateSharedWorkGroupFolderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    caseId: schema.number(),
    parentId: schema.number(),
    name: schema.string(),
  })

  public messages = {
    'caseId.required': 'A case id is required',
    'parentId.required': 'A parent folder id is required',
    'name.required': 'A folder name is required',
  }
}

export class UpdateSharedWorkGroupFolderStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    caseId: schema.number(),
    folderId: schema.number(),
    status: schema.enum(['pending', 'active', 'updating', 'trashed'] as const, [rules.required()]),
  })

  public messages = {
    'caseId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'status.required': 'You must sumbit a valid status',
  }
}

export class UpdateSharedWorkGroupFileStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    caseId: schema.number(),
    folderId: schema.number(),
    fileIds: schema.array().members(schema.number()),
    method: schema.enum(['id', 'folder'] as const, [rules.required()]),
    status: schema.enum(['pending', 'active', 'updating', 'trashed'] as const, [rules.required()]),
  })

  public messages = {
    'caseId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'fileIds.required': 'A list of files to update is required',
    'method.required': 'The type of method to update by is required',
    'status.required': 'You must sumbit a valid status',
  }
}

export class RenameSharedPersonalFolderValidator {
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

export class RenameSharedPersonalFileValidator {
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

export class RenameSharedWorkGroupFolderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    caseId: schema.number(),
    folderId: schema.number(),
    name: schema.string(),
  })

  public messages = {
    'caseId.required': 'A case id is required',
    'folderId.required': 'A folder id is required',
    'name.required': 'A new folder name is required',
  }
}

export class RenameSharedWorkGroupFileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public cacheKey = this.ctx.routeKey

  public schema = schema.create({
    caseId: schema.number(),
    fileId: schema.number(),
    name: schema.string(),
  })

  public messages = {
    'caseId.required': 'A case id is required',
    'fileId.required': 'A file id is required',
    'name.required': 'A new file name is required',
  }
}
