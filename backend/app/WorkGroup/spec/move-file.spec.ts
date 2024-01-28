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
import moveFile from 'App/WorkGroup/MoveFile'

test.group('Move File', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('moveFile rejects non existent folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const result = await moveFile(user.id, [1], 5000000)

    assert.equal(result.error, 'folder-does-not-exist')
  })

  test('moveFile rejects user without access', async (assert) => {
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

    const result = await moveFile(user.id, [1], root.id)

    assert.equal(result.error, 'user-has-no-write-permission')
  })

  test('moveFile moves file to new folder', async (assert) => {
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

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      fileTypeId: 1,
      ownerId: company.user.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'beta',
    }).create()

    const { success } = await moveFile(user.id, [fileB.id], root.id)

    assert.isTrue(success)

    await fileB.refresh()

    assert.equal(fileB.workGroupFolderId, root.id)
  })
})
