import test from 'japa'
import DuplicateFileHandler from 'App/Files/DuplicateFileHandler'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
} from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Duplicate File Handler', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('a non-duplicate workgroup filename returns itself', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.handle()

    assert.equal(res, 'foobar.png')
  })

  test('workGroupFilenameConflicts returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.workGroupFilenameConflicts()

    assert.isTrue(res)
  })

  test('workGroupFilenameConflicts returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.workGroupFilenameConflicts()

    assert.isFalse(res)
  })

  test('workGroupFilenameConflicts returns false if two file names are different status', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.workGroupFilenameConflicts()

    assert.isFalse(res)
  })

  test('workGroupFindNextOrdinal returns 1', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.workGroupFindNextOrdinal(true)

    assert.equal(res, 1)
  })

  test('workGroupFindNextOrdinal returns 3', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'foobar.png',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'foobar (1).png',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'foobar (2).png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.workGroupFindNextOrdinal(true)

    assert.equal(res, 3)
  })

  test('a duplicate workgroup filename returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar.png')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1).png')
  })

  test('a duplicate workgroup filename with multiple breakpoints returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: '1. foobar, baz (1).png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, '1. foobar, baz (1).png')
    const res = await handler.handle()
    assert.equal(res, '1. foobar, baz (1) (1).png')
  })

  test('a duplicate workgroup filename with previous suffix returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: '1. foobar, baz (1) (1).png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, '1. foobar, baz (1) (1).png')
    const res = await handler.handle()
    assert.equal(res, '1. foobar, baz (1) (1) (1).png')
  })

  test('an already suffixed work group file name returns new suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'foobar (1).png',
    }).create()

    const handler = new DuplicateFileHandler('workgroup', root.id, 'foobar (1).png')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1) (1).png')
  })

  test('a non-duplicate personal filename returns itself', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.handle()

    assert.equal(res, 'foobar.png')
  })

  test('personalFilenameConflicts returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.personalFilenameConflicts()

    assert.isTrue(res)
  })

  test('personalFilenameConflicts returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.personalFilenameConflicts()

    assert.isFalse(res)
  })

  test('personalFilenameConflicts returns false if two file names are different status', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.personalFilenameConflicts()

    assert.isFalse(res)
  })

  test('personalFindNextOrdinal returns 1', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.personalFindNextOrdinal(true)

    assert.equal(res, 1)
  })

  test('personalFindNextOrdinal returns 3', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar.png',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar (1).png',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar (2).png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.personalFindNextOrdinal(true)

    assert.equal(res, 3)
  })

  test('a duplicate personal filename returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar.png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar.png')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1).png')
  })

  test('a duplicate pesonal filename with multiple breakpoints returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: '1. foobar, baz (1).png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, '1. foobar, baz (1).png')
    const res = await handler.handle()
    assert.equal(res, '1. foobar, baz (1) (1).png')
  })

  test('a duplicate workgroup filename with previous suffix returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: '1. foobar, baz (1) (1).png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, '1. foobar, baz (1) (1).png')
    const res = await handler.handle()
    assert.equal(res, '1. foobar, baz (1) (1) (1).png')
  })

  test('an already suffixed personal file name returns new suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'foobar (1).png',
    }).create()

    const handler = new DuplicateFileHandler('personal', root.id, 'foobar (1).png')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1) (1).png')
  })

  test('deconstruct filename correctly deconstructs simple filename', async (assert) => {
    const handler = new DuplicateFileHandler('personal', 1, 'foobar.png')
    const res = handler.deconstructFilename(handler.filename)

    assert.equal(res.base, 'foobar')
    assert.equal(res.extension, '.png')
  })

  test('deconstruct filename correctly deconstructs two breakpoints', async (assert) => {
    const handler = new DuplicateFileHandler('personal', 1, '1. foobar.png')
    const res = handler.deconstructFilename(handler.filename)

    assert.equal(res.base, '1. foobar')
    assert.equal(res.extension, '.png')
  })

  test('deconstruct filename correctly deconstructs multiple breakpoints', async (assert) => {
    const handler = new DuplicateFileHandler('personal', 1, '1. foobar .png.png')
    const res = handler.deconstructFilename(handler.filename)

    assert.equal(res.base, '1. foobar .png')
    assert.equal(res.extension, '.png')
  })

  test('deconstruct filename correctly deconstructs multiple breakpoints', async (assert) => {
    const handler = new DuplicateFileHandler('personal', 1, '1. foobar (1).png')
    const res = handler.deconstructFilename(handler.filename)

    assert.equal(res.base, '1. foobar (1)')
    assert.equal(res.extension, '.png')
  })
})
