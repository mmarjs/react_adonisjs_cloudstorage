import test from 'japa'
import { DateTime } from 'luxon'
import { WorkSpaceSearchBody } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import FileCategory from 'App/Models/FileCategory'
import FileType from 'App/Models/FileType'
import WorkSpaceSearch from 'App/WorkSpace/WorkSpaceSearch'
import {
  CompanyFactory,
  CaseFactory,
  UserFactory,
  PersonalFileFactory,
  PersonalFolderFactory,
  WorkGroupFileFactory,
  WorkGroupFolderFactory,
} from 'Database/factories'

test.group('Work Space Search', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('workgroup simple search returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'def.png',
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'simple',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      page: 1,
      limit: 25,
    }
    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 2)
    assert.equal(results?.[0]?.id, fileA.id)
    assert.equal(results?.[1]?.id, fileB.id)
  })

  test('workgroup advanced search size gt returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      size: 2000,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      size: 3000,
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.png',
      size: 5000,
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      size: {
        gt: true,
        bytes: 3000,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.isNotEmpty(results)
    assert.equal(results?.total, 1)
    assert.equal(results?.[0].name, fileC.name)
    assert.equal(results?.[0].id, fileC.id)
  })

  test('workgroup advanced search size lt returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      size: 2000,
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      size: 3000,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.png',
      size: 5000,
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      size: {
        lt: true,
        bytes: 4000,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 2)
    assert.equal(results?.[0].id, fileA.id)
    assert.equal(results?.[1].id, fileB.id)
  })

  test('workgroup advanced search exact date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        exactly: DateTime.local().toISODate(),
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.notEqual(results?.[0].id, fileA.id)
    assert.notEqual(results?.[0].id, fileB.id)
    assert.equal(results?.[0].id, fileC.id)
  })

  test('workgroup advanced search before date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        before: DateTime.local().minus({ days: 2 }).toISODate(),
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileA.id)
    assert.notEqual(results?.[0].id, fileB.id)
    assert.notEqual(results?.[0].id, fileC.id)
  })

  test('workgroup advanced search after date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        after: DateTime.local().minus({ days: 1 }).toISODate(),
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileC.id)
    assert.notEqual(results?.[0].id, fileA.id)
    assert.notEqual(results?.[0].id, fileB.id)
  })

  test('workgroup advanced search between date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        between: {
          after: DateTime.local().minus({ days: 2 }).toISODate(),
          before: DateTime.local().toISODate(),
        },
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 2)
    assert.equal(results?.[0].id, fileB.id)
    assert.equal(results?.[1].id, fileC.id)
  })

  test('workgroup advanced search private access returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      access: 'shared',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      access: 'private',
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      access: 'private',
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileB.id)
  })

  test('workgroup advanced search owner returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const owner = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: owner.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      owner: {
        owner_id: owner.id,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileB.id)
    assert.notEqual(results?.[0].id, fileA.id)
  })

  test('workgroup advanced search for MS Office returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const owner = await UserFactory.create()

    await FileCategory.query().where('category', 'MS Office').preload('files').firstOrFail()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abcdef.docx',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: owner.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.doc',
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      owner: {
        owner_id: owner.id,
      },
      file_type: {
        category: 'MS Office',
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileB.id)
    assert.notEqual(results?.[0].id, fileA.id)
  })

  test('workgroup advanced search all options correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const owner = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: owner.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.mp4',
      size: 3001,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.pdf',
      size: 3000,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: owner.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.md',
      size: 1000,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.doc',
      size: 5000,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: owner.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.xlsx',
      size: 2500,
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'workgroup',
      category_id: caseInstance.id,
      status: 'active',
      folder_id: folder.id,
      access: 'private',
      owner: {
        owner_id: owner.id,
      },
      last_modified: {
        after: DateTime.local().minus({ days: 2 }).toISODate(),
      },
      size: {
        gt: true,
        bytes: 3000,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileB.id)
  })

  test('personal simple search returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'def.png',
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'simple',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 2)
    assert.equal(results?.[0].id, fileA.id)
    assert.equal(results?.[1].id, fileB.id)
  })

  test('personal advanced search size gt returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      size: 2000,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      size: 3000,
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.png',
      size: 5000,
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      size: {
        gt: true,
        bytes: 3000,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].name, fileC.name)
    assert.equal(results?.[0].id, fileC.id)
  })

  test('personal advanced search size lt returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      size: 2000,
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      size: 3000,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.png',
      size: 5000,
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      size: {
        lt: true,
        bytes: 4000,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 2)
    assert.equal(results?.[0].id, fileA.id)
    assert.equal(results?.[1].id, fileB.id)
  })

  test('personal advanced search exact date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: folder.id,

      fileTypeId: 1,

      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        exactly: DateTime.local().toISODate(),
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.notEqual(results?.[0].id, fileA.id)
    assert.notEqual(results?.[0].id, fileB.id)
    assert.equal(results?.[0].id, fileC.id)
  })

  test('personal advanced search before date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        before: DateTime.local().minus({ days: 2 }).toISODate(),
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileA.id)
    assert.notEqual(results?.[0].id, fileB.id)
    assert.notEqual(results?.[0].id, fileC.id)
  })

  test('personal advanced search after date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        after: DateTime.local().minus({ days: 1 }).toISODate(),
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileC.id)
    assert.notEqual(results?.[0].id, fileA.id)
    assert.notEqual(results?.[0].id, fileB.id)
  })

  test('personal advanced search between date returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      userId: user.id,
      companyId: company.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      lastModified: DateTime.local().minus({ days: 3 }),
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.png',
      lastModified: DateTime.local(),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      last_modified: {
        between: {
          after: DateTime.local().minus({ days: 2 }).toISODate(),
          before: DateTime.local().toISODate(),
        },
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 2)
    assert.equal(results?.[0].id, fileB.id)
    assert.equal(results?.[1].id, fileC.id)
  })

  test('personal advanced search private access returns correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,

      fileTypeId: 1,

      status: 'active',
      name: 'abc.jpeg',
      access: 'shared',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.pdf',
      access: 'private',
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      access: 'private',
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileB.id)
  })

  test('personal advanced search all options correct files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      parentId: root.id,
      companyId: company.id,
      userId: user.id,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,

      status: 'active',
      name: 'abc.mp4',
      size: 3001,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,

      fileTypeId: 1,

      status: 'active',
      name: 'abc.pdf',
      size: 3000,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.md',
      size: 1000,
      lastModified: DateTime.local().minus({ days: 1 }),
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.doc',
      size: 5000,
      lastModified: DateTime.local().minus({ days: 10 }),
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'active',
      name: 'abc.xlsx',
      size: 2500,
      lastModified: DateTime.local().minus({ days: 2 }),
    }).create()

    const body: WorkSpaceSearchBody = {
      filename: 'abc',
      search_type: 'advanced',
      category: 'personal',
      category_id: user.id,
      status: 'active',
      folder_id: folder.id,
      access: 'private',
      last_modified: {
        after: DateTime.local().minus({ days: 2 }).toISODate(),
      },
      size: {
        gt: true,
        bytes: 3000,
      },
      page: 1,
      limit: 25,
    }

    const search = new WorkSpaceSearch(body, company.id)
    const results = await search.search()

    assert.equal(results?.total, 1)
    assert.equal(results?.[0].id, fileB.id)
  })
})
