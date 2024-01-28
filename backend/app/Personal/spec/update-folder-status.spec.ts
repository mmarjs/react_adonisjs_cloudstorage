import cuid from 'cuid'
import test from 'japa'
import FileType from 'App/Models/FileType'
import Database from '@ioc:Adonis/Lucid/Database'
import updateFolderStatus from 'App/Personal/UpdateFolderStatus'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'

test.group('Update Folder Status', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('updateFolderStatus updates the status of all descendents', async (assert) => {
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

    assert.equal(folderA.status, 'pending')

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: cuid(),
    }).create()

    assert.equal(folderB.status, 'pending')

    const folderC = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderB.id,
      companyId: company.id,
      name: cuid(),
    }).create()

    assert.equal(folderC.status, 'pending')

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const fileAA = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileAA.status, 'pending')

    const fileAB = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileAB.status, 'pending')

    const fileBA = await PersonalFileFactory.merge({
      personalFolderId: folderB.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileBA.status, 'pending')

    const fileBB = await PersonalFileFactory.merge({
      personalFolderId: folderB.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileBB.status, 'pending')

    const fileCA = await PersonalFileFactory.merge({
      personalFolderId: folderC.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileCA.status, 'pending')

    const fileCB = await PersonalFileFactory.merge({
      personalFolderId: folderC.id,
      name: cuid(),
      fileTypeId: fileType.id,
    }).create()

    assert.equal(fileCB.status, 'pending')

    const { success } = await updateFolderStatus(user.id, folderA.id, 'trashed')

    assert.isTrue(success)

    await folderA.refresh()

    assert.equal(folderA.status, 'trashed')

    await folderB.refresh()

    assert.equal(folderB.status, 'trashed')

    await folderC.refresh()

    assert.equal(folderC.status, 'trashed')

    await fileAA.refresh()
    await fileAB.refresh()

    assert.equal(fileAA.status, 'trashed')
    assert.equal(fileAB.status, 'trashed')

    await fileBA.refresh()
    await fileBB.refresh()

    assert.equal(fileBA.status, 'trashed')
    assert.equal(fileBB.status, 'trashed')

    await fileCA.refresh()
    await fileCB.refresh()

    assert.equal(fileCA.status, 'trashed')
    assert.equal(fileCB.status, 'trashed')
  })
})
