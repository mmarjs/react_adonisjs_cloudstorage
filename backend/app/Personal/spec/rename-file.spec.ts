import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  RoleFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
} from 'Database/factories'
import renameFile from 'App/Personal/RenameFile'

test.group('Rename File', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('renameFilePipeline rejects non existent folder', async (assert) => {
    const result = await renameFile(1, 'foo')

    assert.equal(result.error, 'folder-does-not-exist')
  })

  test('renameFilePipeline with conflicting file name appends suffix', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    await RoleFactory.merge({ companyId: company.id, role: 'account-admin' }).with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'alpha.pdf',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'beta.pdf',
    }).create()

    const result = await renameFile(fileB.id, 'alpha.pdf')

    assert.equal(result.success?.name, 'alpha (1).pdf')
  })

  test('renameFilePipeline moves file to new folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    await RoleFactory.merge({ companyId: company.id, role: 'account-admin' }).with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
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
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
      name: 'beta',
    }).create()

    const { success } = await renameFile(fileB.id, 'gamma')

    assert.equal(success?.id, fileB.id)

    await fileB.refresh()

    assert.equal(fileB.name, 'gamma')
  })
})
