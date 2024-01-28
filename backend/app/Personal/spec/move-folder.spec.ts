import test from 'japa'
import cuid from 'cuid'
import Role from 'App/Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, RoleFactory, PersonalFolderFactory, UserFactory } from 'Database/factories'
import moveFolder from 'App/Personal/MoveFolder'

test.group('Move Folder', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('moveFolder with conflicting folder name appends suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    await RoleFactory.merge({ companyId: company.id, role: 'account-admin' }).with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      status: 'active',
      name: 'beta',
    }).create()

    const folderC = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderB.id,
      companyId: company.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const { success } = await moveFolder(user.id, folderC.id, root.id)

    assert.isTrue(success)
    await folderC.refresh()

    assert.equal(folderC.parentId, root.id)
    assert.equal(folderC.name, 'alpha (1)')
  })

  test('moveFolder returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
      name: 'beta',
    }).create()

    const { success } = await moveFolder(user.id, folderA.id, folderB.id)

    assert.isTrue(success)
  })

  test('moveFolder rejects moving to a child folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: cuid(),
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: cuid(),
      status: 'active',
    }).create()

    const folderASub = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: cuid(),
      status: 'active',
    }).create()

    assert.equal(folderA.parentId, root.id)

    const { error } = await moveFolder(user.id, folderA.id, folderASub.id)

    assert.equal(error, 'cannot-move-folder-into-child-folder')
  })
})
