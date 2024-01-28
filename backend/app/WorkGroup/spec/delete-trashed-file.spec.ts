import test from 'japa'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import deleteTrashedFile from 'App/WorkGroup/DeleteTrashedFile'

import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

test.group('Delete Trashed File', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deleteTrashedFile returns true', async (assert) => {
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

    const fileId = file.id

    const res = await deleteTrashedFile(fileId)
    assert.isTrue(res)

    const refetchedFile = await WorkGroupFile.find(fileId)
    assert.isNull(refetchedFile)
  })

  test('deleteTrashedFile returns false', async (assert) => {
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
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
      name: 'abc.jpeg',
      access: 'shared',
      lastModified: DateTime.local().minus({ days: 4 }),
      size: 4000,
    }).create()

    const fileId = file.id

    const res = await deleteTrashedFile(fileId)
    assert.isFalse(res)
  })
})
