import test from 'japa'
import cuid from 'cuid'
import ShareLink from 'App/Models/ShareLink'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  CaseFactory,
  UserFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
  ShareLinkFactory,
  ShareResourceFactory,
} from 'Database/factories'

test.group('Role Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('exists returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const link = await ShareLinkFactory.merge({
      companyId: company.id,
      grantedById: user.id,
    }).create()

    const res = await ShareLink.exists(link.link)
    assert.isTrue(res)
  })

  test('exists returns false', async (assert) => {
    const res = await ShareLink.exists(cuid())
    assert.isFalse(res)
  })

  test('getResourceId returns workgroup folders case id', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: company.user.id,
    }).create()

    const res = await ShareLink.getResourceId('work_group', root.id, user.id)

    assert.equal(res, root.caseId)
  })

  test('getResourceId returns personal folders user id', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const root = await PersonalFolderFactory.merge({
      userId: company.user.id,
      companyId: company.id,
    }).create()

    const res = await ShareLink.getResourceId('personal', root.id, user.id)

    assert.equal(res, user.id)
  })

  test('downloadFiles download work group file returns correct file', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const grantor = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
      parentId: 0,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const file = await WorkGroupFileFactory.merge({
      ownerId: grantor.id,
      workGroupFolderId: folderA.id,
      fileTypeId: 1,
      lastAccessedById: grantor.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      ownerId: grantor.id,
      workGroupFolderId: folderA.id,
      fileTypeId: 1,
      lastAccessedById: grantor.id,
      status: 'active',
    }).create()

    const shareLink = await ShareLinkFactory.merge({
      resource: 'work_group',
      folderId: folderA.id,
      grantedById: grantor.id,
      companyId: company.id,
      shareType: 'download',
    }).create()

    await ShareResourceFactory.merge({
      shareLinkId: shareLink.id,
      resource: 'work_group_files',
      resourceId: file.id,
    }).create()

    const res = await ShareLink.downloadFiles(shareLink)

    assert.lengthOf(res, 1)
    assert.equal(res[0].id, file.id)
  })

  test('downloadFiles download personal file returns correct file', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const grantor = company.user

    const root = await PersonalFolderFactory.merge({
      userId: grantor.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: grantor.id,
      parentId: root.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const file = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const shareLink = await ShareLinkFactory.merge({
      resource: 'personal',
      folderId: folderA.id,
      grantedById: grantor.id,
      companyId: company.id,
      shareType: 'download',
    }).create()

    await ShareResourceFactory.merge({
      shareLinkId: shareLink.id,
      resource: 'personal_files',
      resourceId: file.id,
    }).create()

    const res = await ShareLink.downloadFiles(shareLink)

    assert.lengthOf(res, 1)
    assert.equal(res[0].id, file.id)
  })
})
