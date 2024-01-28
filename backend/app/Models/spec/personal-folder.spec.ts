import cuid from 'cuid'
import test from 'japa'
import PersonalFolder from 'App/Models/PersonalFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'

test.group('PersonalFolder Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getFolderChildren returns children', async (assert) => {
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

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: cuid(),
      status: 'active',
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const result = await PersonalFolder.getFolderChildren(folderA.id, ['active'])

    assert.lengthOf(result.folders, 1)
    assert.lengthOf(result.files, 1)
    assert.equal(result.folders[0].id, folderB.id)
    assert.equal(result.files[0].id, fileA.id)
  })

  test('getFolders returns folder tree', async (assert) => {
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

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: cuid(),
      status: 'active',
    }).create()

    const result = await PersonalFolder.getFolders(user.id, company.id, ['active'])

    assert.exists(result[0].access)
    assert.exists(result[0].updated_at)

    const resultIds = result.map((r) => r.id)

    assert.isNotEmpty(result)
    assert.isTrue(resultIds.includes(root.id))
    assert.isTrue(resultIds.includes(folderA.id))
    assert.isTrue(resultIds.includes(folderB.id))
  })

  test('getFoldersIn returns folder tree', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      userId: user.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      parentId: root.id,
      userId: user.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const result = await PersonalFolder.getFoldersIn(user.id, root.id, ['active'])

    assert.lengthOf(result, 1)

    assert.equal(result[0].id, folderA.id)
    assert.equal(result[0].parent_id, root.id)
    assert.exists(result[0].access)
    assert.exists(result[0].updated_at)
  })

  test('getFoldersWithPath returns folder tree with path', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: 'Personal',
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: 'Foo',
      status: 'active',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: 'Bar',
      status: 'active',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderB.id,
      companyId: company.id,
      name: 'Baz',
      status: 'active',
    }).create()

    const result = await PersonalFolder.getFoldersWithPath(user.id, 0, ['active'])
    const paths = result.map((r) => r.path)

    assert.lengthOf(paths, 4)
    const url = `p/Foo/Bar/Baz/`

    assert.isTrue(paths.includes(url))
  })

  test('getSelectedFolders returns selected folders', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      companyId: company.id,
      userId: user.id,
    }).create()

    const folders = await PersonalFolderFactory.merge({
      parentId: root.id,
      userId: user.id,
      companyId: company.id,
    }).createMany(3)

    const folderIds = folders.map((f) => f.id)

    const result = await PersonalFolder.getSelectedFolders(folderIds)

    assert.lengthOf(result, 3)

    const resultIds = result.map((r) => r.id)

    resultIds.forEach((id) => {
      assert.isTrue(folderIds.includes(id))
    })
  })

  test('hasChildFolders returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      userId: user.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      parentId: root.id,
      userId: user.id,
      companyId: company.id,
      status: 'active',
    }).create()

    await PersonalFolderFactory.merge({
      parentId: folderA.id,
      userId: user.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const res = await PersonalFolder.hasChildFolders(folderA.id, ['active'])

    assert.isTrue(res)
  })

  test('hasChildFolders returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      parentId: 0,
      userId: user.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const res = await PersonalFolder.hasChildFolders(root.id, ['active'])
    assert.isFalse(res)
  })

  test('isChildFolder returns true', async (assert) => {
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
      status: 'active',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: cuid(),
      status: 'active',
    }).create()

    const result = await PersonalFolder.isChildFolder(user.id, folderA.id, folderB.id, 'active')

    assert.isTrue(result)
  })

  test('isChildFolder returns false', async (assert) => {
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
      status: 'active',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: folderA.id,
      companyId: company.id,
      name: cuid(),
      status: 'trashed',
    }).create()

    const result = await PersonalFolder.isChildFolder(user.id, folderA.id, folderB.id, 'active')

    assert.isFalse(result)
  })
})
