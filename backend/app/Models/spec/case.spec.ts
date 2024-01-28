import test from 'japa'
import Case from 'App/Models/Case'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

test.group('Case Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('nextPublicId generates next id', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    await CaseFactory.merge({ companyId: company.id, publicCaseId: 'CID0000001' }).create()
    const res = await Case.nextPublicId(company.id)

    assert.lengthOf(res, 10)
    assert.equal(res, 'CID0000002')
  })

  test('idsByCompany returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await CaseFactory.merge({ companyId: company.id }).createMany(3)

    const res = await Case.idsByCompany(company.id)
    assert.lengthOf(res, 3)
  })

  test('belongsToCompany returns true', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const res = await Case.belongsToCompany(c.id, company.id)
    assert.isTrue(res)
  })

  test('belongsToCompany returns false', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await CaseFactory.merge({ companyId: company.id }).create()
    const caseInstance = await CaseFactory.with('company', 1, (q) => q.with('user', 1)).create()

    const res = await Case.belongsToCompany(caseInstance.id, company.id)
    assert.isFalse(res)
  })

  test.skip('getTotalFileSizeByCaseIds returns list of total file size by active caseId', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstanceA = await CaseFactory.merge({
      companyId: company.id,
      status: 'active',
    }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstanceA.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstanceA.id,
      parentId: root.id,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 10,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 20,
      status: 'active',
    }).create()

    const caseIds = [caseInstanceA.id]
    const result = await Case.totalFileSize(caseIds)

    assert.equal(result, 30)
  })

  test('getFileSizeWithCaseId with ', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstanceA = await CaseFactory.merge({
      companyId: company.id,
      status: 'active',
    }).create()

    const caseInstanceB = await CaseFactory.merge({
      companyId: company.id,
      status: 'active',
    }).create()

    const rootA = await WorkGroupFolderFactory.merge({
      caseId: caseInstanceA.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstanceA.id,
      parentId: rootA.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: rootA.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 10,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 20,
      status: 'active',
    }).create()

    const rootB = await WorkGroupFolderFactory.merge({
      caseId: caseInstanceB.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstanceB.id,
      parentId: rootA.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: rootB.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 40,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: user.id,
      fileTypeId: 1,
      lastAccessedById: user.id,
      size: 60,
      status: 'active',
    }).create()

    const caseIds = [caseInstanceA.id, caseInstanceB.id]
    const res = await Case.fileSizeWithCaseId(caseIds)

    assert.lengthOf(res, 2)
  })
})
