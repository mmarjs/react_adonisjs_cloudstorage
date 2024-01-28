import test from 'japa'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import PersonalFile from 'App/Models/PersonalFile'
import deleteTrashedFile from 'App/Personal/DeleteTrashedFile'

test.group('Delete Trashed File', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('permanentlyDeleteTrashedFile returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
    }).create()

    const folder = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
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

    const fileId = file.id

    const res = await deleteTrashedFile(fileId)
    assert.isTrue(res)

    const refetchedFile = await PersonalFile.find(fileId)
    assert.isNull(refetchedFile)
  })

  test('permanentlyDeleteTrashedFile returns false', async (assert) => {
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
    }).create()

    const file = await PersonalFileFactory.merge({
      personalFolderId: folder.id,
      fileTypeId: 1,
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
