import test from 'japa'
import FileType from 'App/Models/FileType'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'
import cuid from 'cuid'
import Database from '@ioc:Adonis/Lucid/Database'
import updateFileStatus from 'App/Personal/UpdateFileStatus'

test.group('Update File Status', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('updateFileStatus updates each file', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: cuid(),
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: cuid(),
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileA.status, 'pending')
    assert.equal(fileB.status, 'pending')

    const { success } = await updateFileStatus([fileA.id, fileB.id], 'trashed')

    assert.isTrue(success)

    await fileA.refresh()
    await fileB.refresh()

    assert.equal(fileA.status, 'trashed')
    assert.equal(fileB.status, 'trashed')
  })
})
