import test from 'japa'
import AccessLog from 'App/Models/AccessLog'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  UserFactory,
} from 'Database/factories'

import moveFolder from 'App/WorkGroup/MoveFolder'

test.group('Move Folder Pipeline', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('moveFolder rejects user without access', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
    }).create()

    const result = await moveFolder(caseInstance.id, root.id, root.id, user.id, company.id)

    assert.equal(result.error, 'user-has-no-write-permission')
  })

  test('moveFolder with conflicting folder name appends suffix', async (assert) => {
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

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'beta',
    }).create()

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const result = await moveFolder(caseInstance.id, folderC.id, root.id, user.id, company.id)

    assert.isTrue(result.success)
    await folderC.refresh()
    assert.equal(folderC.parentId, root.id)
    assert.equal(folderC.name, 'alpha (1)')
  })

  test('moveFolder returns new folder', async (assert) => {
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

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'beta',
    }).create()

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'collatz',
    }).create()

    const result = await moveFolder(caseInstance.id, folderC.id, root.id, user.id, company.id)

    assert.isTrue(result.success)

    const logs = await AccessLog.all()
    assert.lengthOf(logs, 1)
  })
})
