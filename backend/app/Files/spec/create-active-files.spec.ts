import test from 'japa'
import cuid from 'cuid'
import Database from '@ioc:Adonis/Lucid/Database'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import PersonalFile from 'App/Models/PersonalFile'
import { ActiveFileParams } from 'App/types'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  PersonalFolderFactory,
} from 'Database/factories'
import { DateTime } from 'luxon'
import CreateActiveFiles from 'App/Files/CreateActiveFiles'

test.group('Create Active Files', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('create 3 files, 2 workgroup, 1 personal', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const workGroupFolder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const personalFolder = await PersonalFolderFactory.merge({
      companyId: company.id,
      userId: user.id,
    }).create()

    const params: ActiveFileParams = {
      folderId: workGroupFolder.id,
      resource: 'workgroup',
      files: [
        {
          resource: 'workgroup',
          folder_id: workGroupFolder.id,
          filename: 'hey.png',
          size: 1000,
          path: `workgroup-${caseInstance.id}/${cuid()}/hey.png`,
          last_modified: DateTime.local().toISODate(),
        },
        {
          resource: 'workgroup',
          folder_id: workGroupFolder.id,
          filename: 'cat.png',
          size: 1000,
          path: `workgroup-${caseInstance.id}/${cuid()}/cat.png`,
          last_modified: DateTime.local().toISODate(),
        },
        {
          resource: 'personal',
          folder_id: personalFolder.id,
          filename: 'dog.png',
          size: 1000,
          path: `personal-${user.id}/${cuid()}/dog.png`,
          last_modified: DateTime.local().toISODate(),
        },
      ],
    }

    const actor = new CreateActiveFiles(user.id, params)
    const { success } = await actor.create()
    assert.isTrue(success)

    const workGroupFiles = await WorkGroupFile.query()
      .where('work_group_folder_id', workGroupFolder.id)
      .where('status', 'active')

    const personalFiles = await PersonalFile.query()
      .where('personal_folder_id', personalFolder.id)
      .where('status', 'active')

    assert.lengthOf(workGroupFiles, 2)
    assert.lengthOf(personalFiles, 1)
  })

  test('filename collision adds suffix to new file v2', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      name: 'foo.pdf',
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      name: 'foo (1).pdf',
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    const params: ActiveFileParams = {
      folderId: root.id,
      resource: 'workgroup',
      files: [
        {
          resource: 'workgroup',
          folder_id: root.id,
          filename: 'foo.pdf',
          size: 1000,
          path: `workgroup-${caseInstance.id}/${cuid()}/foo.pdf`,
          last_modified: DateTime.local().toISODate(),
        },
      ],
    }

    const actor = new CreateActiveFiles(user.id, params)
    const { success } = await actor.create()
    assert.isTrue(success)

    const files = await WorkGroupFile.query().select('name').where('work_group_folder_id', root.id)
    const names = files.map((f) => f.name)
    assert.isTrue(names.some((n) => n === 'foo (2).pdf'))
  })

  test('filename collision adds suffix to new file', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      name: 'foo.pdf',
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    const params: ActiveFileParams = {
      folderId: root.id,
      resource: 'workgroup',
      files: [
        {
          resource: 'workgroup',
          folder_id: root.id,
          filename: 'foo.pdf',
          size: 1000,
          path: `workgroup-${caseInstance.id}/${cuid()}/foo.pdf`,
          last_modified: DateTime.local().toISODate(),
        },
      ],
    }

    const actor = new CreateActiveFiles(user.id, params)
    const { success } = await actor.create()
    assert.isTrue(success)

    const files = await WorkGroupFile.query().select('name').where('work_group_folder_id', root.id)
    const names = files.map((f) => f.name)
    assert.isTrue(names.some((n) => n === 'foo (1).pdf'))
  })

  test('pipeline fails when folder is invalid', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const params: ActiveFileParams = {
      folderId: 3222,
      resource: 'workgroup',
      files: [
        {
          resource: 'workgroup',
          folder_id: 457,
          filename: 'hey.png',
          size: 1000,
          path: `workgroup-1/${cuid()}/hey.png`,
          last_modified: DateTime.local().toISODate(),
        },
        {
          resource: 'workgroup',
          folder_id: 458,
          filename: 'cat.png',
          size: 1000,
          path: `workgroup-1/${cuid()}/cat.png`,
          last_modified: DateTime.local().toISODate(),
        },
        {
          resource: 'personal',
          folder_id: 459,
          filename: 'dog.png',
          size: 1000,
          path: `personal-user.id/${cuid()}/dog.png`,
          last_modified: DateTime.local().toISODate(),
        },
      ],
    }

    const actor = new CreateActiveFiles(user.id, params)
    const { error } = await actor.create()

    assert.equal(error, 'hey.png,cat.png,dog.png')
  })
})
