import test from 'japa'
import FileType from 'App/Models/FileType'
import Database from '@ioc:Adonis/Lucid/Database'
import PersonalFolder from 'App/Models/PersonalFolder'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'
import PersonalFile from 'App/Models/PersonalFile'
import deleteTrashedFolder from 'App/Personal/DeleteTrashedFolder'

test.group('Personal Folders', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deleteTrashedFolder returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
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
      status: 'trashed',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      status: 'trashed',
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: fileType.id,
      status: 'trashed',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folderB.id,
      fileTypeId: fileType.id,
      status: 'trashed',
    }).create()

    const { folderName, fileIds } = await deleteTrashedFolder(folderA.id)

    assert.equal(folderName, folderA.name)
    assert.lengthOf(fileIds, 2)
    const deletedFiles = await PersonalFile.query().whereIn('id', fileIds)
    assert.lengthOf(deletedFiles, 0)
    assert.isTrue(fileIds.includes(fileA.id))
    assert.isTrue(fileIds.includes(fileB.id))
    assert.isNull(await PersonalFolder.find(folderA.id))
    assert.isNull(await PersonalFolder.find(folderB.id))
  })

  test('deleteTrashedFolder returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      status: 'active',
    }).create()

    let isError = false
    try {
      await deleteTrashedFolder(folderA.id)
    } catch (err) {
      isError = true
    }

    assert.isTrue(isError)
  })
})
