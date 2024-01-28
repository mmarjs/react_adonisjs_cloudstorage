import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  RoleFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
} from 'Database/factories'
import moveFile from 'App/Personal/MoveFile'

test.group('Move File', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('moveFile rejects non existent folder', async (assert) => {
    const result = await moveFile([10000], 10000)

    assert.equal(result.error, 'folder-does-not-exist')
  })

  test('moveFile moves file to new folder', async (assert) => {
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
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'alpha',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      status: 'active',
      name: 'gamma',
    }).create()

    const { success } = await moveFile([fileB.id], root.id)

    assert.isTrue(success)

    await fileB.refresh()

    assert.equal(fileB.personalFolderId, root.id)
  })
})
