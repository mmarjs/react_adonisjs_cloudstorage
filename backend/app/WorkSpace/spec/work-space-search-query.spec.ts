import test from 'japa'
import cuid from 'cuid'
import { DateTime } from 'luxon'
import { WorkSpaceSearchBody } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import FileVariant from 'App/Models/FileVariant'
import FileCategory from 'App/Models/FileCategory'
import WorkGroupSearchQuery from 'App/WorkSpace/WorkSpaceSearchQuery'
import { CompanyFactory, CaseFactory } from 'Database/factories'

test.group('Work Space Search Query', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('simple query returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const body: WorkSpaceSearchBody = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = query.simple()

    assert.equal(res.conditions, 'status = :status AND name LIKE :filename')
    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
  })

  test('advanced query basic returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const body: WorkSpaceSearchBody = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = query.simple()

    assert.equal(res.conditions, 'status = :status AND name LIKE :filename')
    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
  })

  test('search size with greater than returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      size: {
        gt: true,
        bytes: 445454,
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(res.conditions, 'status = :status AND name LIKE :filename AND size > :size')

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['size'], body?.size?.bytes)
  })

  test('search size with less than returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      size: {
        lt: true,
        bytes: 445454,
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(res.conditions, 'status = :status AND name LIKE :filename AND size < :size')

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['size'], body?.size?.bytes)
  })

  test('search last modified with exact date returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const modified = DateTime.local().minus({ years: 1 })

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      last_modified: {
        exactly: modified.toISO(),
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND DATE(last_modified) = :last_modified'
    )

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['last_modified'], body?.last_modified?.exactly)
  })

  test('search last modified with after date returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const modified = DateTime.local().minus({ months: 1 })

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      last_modified: {
        after: modified.toISO(),
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND DATE(last_modified) > :last_modified'
    )

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['last_modified'], body?.last_modified?.after)
  })

  test('search last modified with before date returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const modified = DateTime.local().minus({ months: 4 })

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      last_modified: {
        before: modified.toISO(),
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND DATE(last_modified) < :last_modified'
    )

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['last_modified'], body?.last_modified?.before)
  })

  test('search last modified between dates returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const after = DateTime.local().minus({ months: 4 })
    const before = DateTime.local().minus({ days: 1 })

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      last_modified: {
        between: {
          after: after.toISO(),
          before: before.toISO(),
        },
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND DATE(last_modified) BETWEEN :last_modified_after AND :last_modified_before'
    )

    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['last_modified_after'], body?.last_modified?.between?.after)
    assert.equal(res.params['last_modified_before'], body?.last_modified?.between?.before)
  })

  test('search access returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      access: 'shared',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(res.conditions, 'status = :status AND name LIKE :filename AND access = :access')

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['access'], body?.access)
  })

  test('search workgroup owner returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      owner: {
        owner_id: company.user.id,
      },
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND owner_id = :owner_id'
    )

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['owner_id'], body.owner?.owner_id)
  })

  test('search personal owner returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      owner: {
        owner_id: 3434,
      },
      category: 'personal',
      category_id: company.user.id,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    assert.equal(res.conditions, 'status = :status AND name LIKE :filename')

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
  })

  test('search file category returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const category = await FileCategory.query()
      .where('category', 'MS Office')
      .preload('files')
      .firstOrFail()

    assert.isNotEmpty(category)

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      category: 'personal',
      category_id: company.user.id,
      status: 'active',
      folder_id: 1,
      file_type: {
        category: 'MS Office',
      },
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    const fileTypeIds = category.files.map((f) => f.id).join(',')

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND file_type_id IN (:file_type_ids)'
    )

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['file_type_ids'], `${fileTypeIds}`)
  })

  test('search file extension returns correct format', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const variant = await FileVariant.query().where('ext', 'docx').firstOrFail()

    assert.isNotEmpty(variant)

    const body: WorkSpaceSearchBody = {
      search_type: 'advanced',
      filename: cuid(),
      category: 'personal',
      category_id: company.user.id,
      status: 'active',
      folder_id: 1,
      file_type: {
        extension: 'docx',
      },
      page: 1,
      limit: 25,
    }

    const query = new WorkGroupSearchQuery(body)
    const res = await query.advanced()

    const fileTypeIds = variant.fileTypeId

    assert.equal(
      res.conditions,
      'status = :status AND name LIKE :filename AND file_type_id IN (:file_type_ids)'
    )

    assert.equal(res.params['status'], body.status)
    assert.equal(res.params['filename'], `%${body.filename}%`)
    assert.equal(res.params['file_type_ids'], `${fileTypeIds}`)
  })
})
