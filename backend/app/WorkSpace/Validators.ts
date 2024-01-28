import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class WorkSpaceSearchValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    search_type: schema.enum(['simple', 'advanced'] as const, [rules.required()]),
    filename: schema.string.optional(),
    folder_id: schema.number([rules.range(0, 2.1e8)]),
    status: schema.enum(['pending', 'active', 'updating', 'trashed'] as const, [rules.required()]),
    size: schema.object.optional().members({
      gt: schema.boolean.optional(),
      lt: schema.boolean.optional(),
      bytes: schema.number(),
    }),
    last_modified: schema.object.optional().members({
      exactly: schema.string.optional(),
      before: schema.string.optional(),
      after: schema.string.optional(),
      between: schema.object.optional().members({
        before: schema.string(),
        after: schema.string(),
      }),
    }),
    access: schema.enum.optional(['private', 'shared'] as const),
    category: schema.string(),
    category_id: schema.number(),
    file_type: schema.object.optional().members({
      category: schema.string.optional(),
      extension: schema.string.optional(),
    }),
    owner: schema.object.optional().members({
      owner_id: schema.number(),
    }),
    page: schema.number([rules.unsigned()]),
    limit: schema.number([rules.unsigned()]),
  })

  public messages = {
    'search_type.required': 'A search type is required',
    'folder_id.required': 'A folder_id is required',
    'category.required': 'A category is required',
    'category_id.required': 'A category id is required',
    'status.required': 'A status is required',
    'page.required': 'A page is required',
    'limit.required': 'A limit is required',
  }
}
