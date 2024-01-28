import test from 'japa'
import { DateTime } from 'luxon'
import FileType from 'App/Models/FileType'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

test.group('WorkGroupFile Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getCaseIdFromWorkGroupFolder returns caseId', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: 0,
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    const caseId = await WorkGroupFile.getCaseId(file.id)

    assert.equal(caseInstance.id, caseId)
  })

  test('getFiles returns list of files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: fileType.id,
      lastAccessedById: user.id,
    })
      .apply('active')
      .createMany(3)

    const folderIds = [root.id, folderA.id, folderB.id]
    const result = await WorkGroupFile.getFiles(folderIds, ['active'])

    assert.isNotEmpty(result)
    assert.lengthOf(result, 3)
  })

  test('getFilesIn returns list of files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: fileType.id,
      lastAccessedById: user.id,
    })
      .apply('active')
      .createMany(15)

    const result = await WorkGroupFile.getFilesIn(folderA.id, ['active'], 1, 10)

    assert.isNotEmpty(result)
    assert.lengthOf(result, 10)
  })

  test('getFilesIdsInFolder returns correct file ids', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
      status: 'active',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
      status: 'active',
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
      status: 'trashed',
    }).create()

    const result = await WorkGroupFile.getFilesIdsInFolder(root.id, ['active'])

    assert.lengthOf(result, 2)

    assert.isTrue(result.includes(fileA.id))
    assert.isTrue(result.includes(fileB.id))
    assert.isFalse(result.includes(fileC.id))
  })

  test('getSelectedFiles returns selected files', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const files = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: fileType.id,
      lastAccessedById: user.id,
    })
      .apply('active')
      .createMany(3)

    const fileIds = files.map((f) => f.id)

    const result = await WorkGroupFile.getSelectedFiles(fileIds, ['active'])

    assert.lengthOf(result, 3)

    const resultIds = result.map((r) => r.id)

    resultIds.forEach((id) => {
      assert.isTrue(fileIds.includes(id))
    })
  })

  test('Get files of active folders', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const results = await WorkGroupFile.getTrashedFilesByActiveFolder(caseInstance.id)
    assert.lengthOf(results, 1)
    assert.equal(results[0].id, file.id)
  })

  test('Get files of active folders, return empty result', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'trashed',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const results = await WorkGroupFile.getTrashedFilesByActiveFolder(caseInstance.id)
    assert.lengthOf(results, 0)
  })

  test('getFileSizeByFolderIds returns correct number', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'trashed',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'private',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 5000,
    }).create()

    const res = await WorkGroupFile.getFileSizeByFolderIds([folder.id])
    assert.equal(res, 9000)
  })

  test('getFileSizeByFolderIds returns 0', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'trashed',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'private',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 5000,
    }).create()

    const res = await WorkGroupFile.getFileSizeByFolderIds([root.id])
    assert.equal(res, 0)
  })
})
