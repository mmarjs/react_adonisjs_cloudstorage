import test from 'japa'
import FileType from 'App/Models/FileType'
import Database from '@ioc:Adonis/Lucid/Database'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'
import deleteTrashedFolder from 'App/WorkGroup/DeleteTrashedFolder'
import WorkGroupFile from 'App/Models/WorkGroupFile'

test.group('Delete Trashed Folder', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deleteTrashedFolder returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'trashed',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: company.user.id,
      status: 'trashed',
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    const { folderName, fileIds } = await deleteTrashedFolder(folderA.id)

    assert.equal(folderName, folderA.name)
    assert.lengthOf(fileIds, 2)
    const deletedFiles = await WorkGroupFile.query().whereIn('id', fileIds)
    assert.lengthOf(deletedFiles, 0)
    assert.isTrue(fileIds.includes(fileA.id))
    assert.isTrue(fileIds.includes(fileB.id))
    assert.isNull(await WorkGroupFolder.find(folderA.id))
    assert.isNull(await WorkGroupFolder.find(folderB.$isDirty))
  })

  test('deleteTrashedFolder returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
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
