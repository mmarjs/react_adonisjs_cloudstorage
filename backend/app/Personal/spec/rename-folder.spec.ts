import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, RoleFactory, PersonalFolderFactory } from 'Database/factories'
import renameFolder from 'App/Personal/RenameFolder'

test.group('Rename Folder', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('renameFolder with conflicting folder name appends suffix', async (assert) => {
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

    const result = await renameFolder(folderB.id, 'alpha')

    assert.isTrue(result.success)

    await folderB.refresh()
    assert.equal(folderB.name, 'alpha (1)')
  })

  test('renameFolder returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    await RoleFactory.merge({ companyId: company.id, role: 'account-admin' }).with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      status: 'active',
      name: 'alpha',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      status: 'active',
      name: 'beta',
    }).create()

    const result = await renameFolder(folderB.id, 'gamma')

    assert.isTrue(result.success)
  })
})
