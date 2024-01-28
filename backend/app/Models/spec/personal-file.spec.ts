import test from 'japa'
import cuid from 'cuid'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import PersonalFile from 'App/Models/PersonalFile'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'

test.group('PersonalFile Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getFiles returns list of files', async (assert) => {
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

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: cuid(),
    }).create()
    await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: 1,
    })
      .apply('active')
      .createMany(3)

    const folderIds = [root.id, folderA.id, folderB.id]
    const result = await PersonalFile.getFiles(folderIds, ['active'])

    assert.isNotEmpty(result)
    assert.lengthOf(result, 3)
  })

  test('getFilesIn returns list of files', async (assert) => {
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

    await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: 1,
    })
      .apply('active')
      .createMany(15)

    const result = await PersonalFile.getFilesIn(folderA.id, ['active'], 1, 10)

    assert.isNotEmpty(result)
    assert.lengthOf(result, 10)
  })

  test('getFilesIdsInFolder returns correct file ids', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: cuid(),
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'trashed',
    }).create()

    const result = await PersonalFile.getFilesIdsInFolder(root.id, 'active')

    assert.lengthOf(result, 2)
    assert.isTrue(result.includes(fileA.id))
    assert.isTrue(result.includes(fileB.id))
    assert.isFalse(result.includes(fileC.id))
  })

  test('getSelectedFiles returns selected files', async (assert) => {
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

    const files = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: 1,
    })
      .apply('active')
      .createMany(3)

    const fileIds = files.map((f) => f.id)

    const result = await PersonalFile.getSelectedFiles(fileIds, ['active'])

    assert.lengthOf(result, 3)

    const resultIds = result.map((r) => r.id)

    resultIds.forEach((id) => {
      assert.isTrue(fileIds.includes(id))
    })
  })

  test('Get files of active folders', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const file = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const results = await PersonalFile.getTrashedFilesByActiveFolder(user.id, company.id)
    assert.lengthOf(results, 1)
    assert.equal(results[0].id, file.id)
  })

  test('Get files of active folders, return empty result', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'trashed',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const results = await PersonalFile.getTrashedFilesByActiveFolder(user.id, company.id)
    assert.lengthOf(results, 0)
  })

  test('getFileSizeByFolderIds returns correct number', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'trashed',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'private',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 5000,
    }).create()

    const res = await PersonalFile.getFileSizeByFolderIds([folder.id])
    assert.equal(res, 9000)
  })

  test('getFileSizeByFolderIds returns 0', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'trashed',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'private',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 5000,
    }).create()

    const res = await PersonalFile.getFileSizeByFolderIds([root.id])
    assert.equal(res, 0)
  })
})
