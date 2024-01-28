import test from 'japa'
import DuplicateFolderHandler from 'App/Files/DuplicateFolderHandler'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  PersonalFolderFactory,
} from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Duplicate Folder Handler', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('a non-duplicate workgroup folder name returns itself', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar')
    const res = await handler.handle()

    assert.equal(res, 'foobar')
  })

  test('workGroupFolderNameConflicts returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar')
    const res = await handler.workGroupFolderNameConflicts()

    assert.isTrue(res)
  })

  test('workGroupFilenameConflicts returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar')
    const res = await handler.workGroupFolderNameConflicts()

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

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar')
    const res = await handler.workGroupFindNextOrdinal()

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

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar (1)',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar (2)',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar')
    const res = await handler.workGroupFindNextOrdinal()

    assert.equal(res, 3)
  })

  test('a duplicate workgroup folder returns the correct ordinality in the name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1)')
  })

  test('workGroupFilenameConflicts returns false if two file names are different status', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'trashed',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler(
      'workgroup',
      caseInstance.id,
      root.parentId,
      'foobar'
    )
    const res = await handler.workGroupFolderNameConflicts()

    assert.isFalse(res)
  })

  test('an already suffixed work group folder name returns new suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar (1)',
    }).create()

    const handler = new DuplicateFolderHandler('workgroup', caseInstance.id, root.id, 'foobar (1)')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1) (1)')
  })

  test('a non-duplicate personal filename returns itself', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.handle()

    assert.equal(res, 'foobar')
  })

  test('personalFolderNameConflicts returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.personalFolderNameConflicts()

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

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.personalFolderNameConflicts()

    assert.isFalse(res)
  })

  test('personalFilenameConflicts returns false if two file names are different status', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const root = await PersonalFolderFactory.merge({
      userId: company.userId,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFolderFactory.merge({
      userId: company.user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'trashed',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler(
      'workgroup',
      company.user.id,
      root.parentId,
      'foobar'
    )
    const res = await handler.workGroupFolderNameConflicts()

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

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.personalFindNextOrdinal()

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

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar (1)',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar (2)',
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.personalFindNextOrdinal()

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

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1)')
  })

  test('an already suffixed personal file name returns new suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar (1)',
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar (1)')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1) (1)')
  })

  test('restoring a folder from the trash handles duplicates', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const handler = new DuplicateFolderHandler('personal', user.id, root.id, 'foobar')
    const res = await handler.handle()
    assert.equal(res, 'foobar (1)')
  })
})
