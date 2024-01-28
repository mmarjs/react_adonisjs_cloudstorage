import test from 'japa'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

test.group('Role Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getCaseId returns caseId', async (assert) => {
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

    const caseId = await WorkGroupFolder.getCaseId(folder.id)

    assert.equal(caseInstance.id, caseId)
  })

  test('getCaseId returns null', async (assert) => {
    const caseId = await WorkGroupFolder.getCaseId(0)

    assert.isNull(caseId)
  })

  test('getFolderChildren returns children', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
    }).create()

    const result = await WorkGroupFolder.getFolderChildren(folderB.id, ['active'])

    assert.lengthOf(result.folders, 1)
    assert.lengthOf(result.files, 1)
    assert.equal(result.folders[0].id, folderC.id)
    assert.equal(result.files[0].id, fileA.id)
  })

  test('getFolders returns folder tree', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: user.id,
      status: 'pending',
    }).create()

    const result = await WorkGroupFolder.getFolders(caseInstance.id, ['active'])
    const resultIds = result.map((r) => r.id)
    assert.isFalse(resultIds.includes(folderC.id))

    assert.lengthOf(result, 3)
    assert.equal(result[0].id, root.id)
    assert.equal(result[0].parent_id, 0)
    assert.exists(result[0].access)
    assert.exists(result[0].updated_at)

    assert.equal(result[1].id, folderA.id)
    assert.equal(result[1].parent_id, root.id)
    assert.exists(result[1].access)
    assert.exists(result[1].updated_at)

    assert.equal(result[2].id, folderB.id)
    assert.equal(result[2].parent_id, folderA.id)
    assert.exists(result[2].access)
    assert.exists(result[2].updated_at)
  })

  test('getFoldersIn returns folder tree', async (assert) => {
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
      status: 'active',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: user.id,
      status: 'trashed',
    }).create()

    const result = await WorkGroupFolder.getFoldersIn(caseInstance.id, root.id, ['active'])

    assert.lengthOf(result, 1)

    assert.equal(result[0].id, folderA.id)
    assert.equal(result[0].parent_id, root.id)
    assert.exists(result[0].access)
    assert.exists(result[0].updated_at)
    assert.notEqual(result[0].id, folderB.id)
  })

  test('getFoldersWithPath returns folder tree with paths', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const caseId = caseInstance.id

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
      name: 'Workgroup',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'active',
      name: 'Foo',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: user.id,
      status: 'active',
      name: 'Bar',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: user.id,
      status: 'active',
      name: 'Baz',
    }).create()

    const result = await WorkGroupFolder.getFoldersWithPath(caseInstance.id, 0, ['active'])
    const paths = result.map((r) => r.path)

    assert.lengthOf(paths, 4)
    const url = `w/${caseId}/Foo/Bar/Baz/`

    assert.isTrue(paths.includes(url))
  })

  test('getSelectedFolders returns selected folders', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folders = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
    }).createMany(3)

    const folderIds = folders.map((f) => f.id)

    const result = await WorkGroupFolder.getSelectedFolders(folderIds)

    assert.lengthOf(result, 3)

    const resultIds = result.map((r) => r.id)

    resultIds.forEach((id) => {
      assert.isTrue(folderIds.includes(id))
    })
  })

  test('hasChildFolders returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const res = await WorkGroupFolder.hasChildFolders(folderA.id, ['active'])

    assert.isTrue(res)
  })

  test('hasChildFolders returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const res = await WorkGroupFolder.hasChildFolders(root.id, ['active'])
    assert.isFalse(res)
  })

  test('isChildFolder returns true', async (assert) => {
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

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const res = await WorkGroupFolder.isChildFolder(caseInstance.id, folderA.id, folderB.id)

    assert.isTrue(res)
  })

  test('isChildFolder returns false', async (assert) => {
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

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: company.user.id,
    }).create()

    const res = await WorkGroupFolder.isChildFolder(caseInstance.id, folderB.id, folderA.id)

    assert.isFalse(res)
  })
})
