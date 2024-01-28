import test from 'japa'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  UserFactory,
} from 'Database/factories'
import renameFile from 'App/WorkGroup/RenameFile'

test.group('Rename File', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('renameFile rejects non existent folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const result = await renameFile(user.id, 1, 1, 'foo')

    assert.equal(result.error, 'folder-does-not-exist')
  })

  test('renameFile rejects user without access', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: company.user.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const result = await renameFile(user.id, company.id, file.id, 'foo')

    assert.equal(result.error, 'user-has-no-write-permission')
  })

  test('renameFile with conflicting file name appends suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: company.user.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'alpha.pdf',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: company.user.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'beta.pdf',
    }).create()

    const result = await renameFile(user.id, company.id, fileB.id, 'alpha (1).pdf')

    assert.equal(result.success?.name, 'alpha (1).pdf')
  })

  test('renameFile moves file to new folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: company.user.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: company.user.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'beta',
    }).create()

    const { success } = await renameFile(user.id, company.id, fileB.id, 'gamma')

    assert.equal(success?.id, fileB.id)

    await fileB.refresh()

    assert.equal(fileB.name, 'gamma')
  })
})
