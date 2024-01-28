import test from 'japa'
import cuid from 'cuid'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  RoleFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
} from 'Database/factories'
import FileType from 'App/Models/FileType'
import { WorkSpaceSearchBody } from 'App/types'
import { DateTime } from 'luxon'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'

const BASE_URL = Env.get('APP_URL')

test.group('WorkSpace Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('workspace directory returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .createMany(3)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
      status: 'active',
      name: 'Workgroup',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'active',
      name: 'Foo',
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: user.id,
      fileTypeId: fileType.id,
      lastAccessedById: user.id,
      status: 'active',
      name: 'Bar',
    }).create()

    const personalRoot = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
      name: 'Personal',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: personalRoot.id,
      companyId: company.id,
      status: 'active',
      name: 'Baz',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: personalRoot.id,
      fileTypeId: fileType.id,
      status: 'active',
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/workspace/directory/${caseInstance.id}`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.users, 3)
        assert.lengthOf(res.body.workGroupData, 2)
        assert.lengthOf(res.body.personalData, 2)
      })

    deleteAuth(token)
  })

  test('workspace directory with invalid permission returns 403', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .create()

    const user = role.user

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/workspace/directory/${caseInstance.id}`)
      .set('token', token)
      .expect(403)
      .then((res) => {
        assert.equal(res.body.error, 'user-has-no-read-permission')
      })

    deleteAuth(token)
  })

  test('minimum data passes valiation', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const token = await makeAuth(user.id, company.id)

    const body: WorkSpaceSearchBody = {
      search_type: 'simple',
      category: 'workgroup',
      category_id: 1,
      status: 'active',
      folder_id: 1,
      page: 1,
      limit: 25,
    }

    await supertest(BASE_URL).post('/workspace/search').set('token', token).send(body).expect(200)

    await deleteAuth(token)
  })

  test('size requires bytes when present', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const token = await makeAuth(user.id, company.id)

    const body = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: 1,
      status: 'active',
      folder_id: 1,
      size: {},
      offset: 0,
    }

    await supertest(BASE_URL).post('/workspace/search').set('token', token).send(body).expect(422)

    await deleteAuth(token)
  })

  test('size with bytes passes validation', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const token = await makeAuth(user.id, company.id)

    const body = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: 1,
      status: 'active',
      folder_id: 1,
      size: {
        gt: true,
        bytes: 343534,
      },
      page: 1,
      limit: 25,
    }

    await supertest(BASE_URL).post('/workspace/search').set('token', token).send(body).expect(200)

    await deleteAuth(token)
  })

  test('last_modifed between without dates fails validation', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const token = await makeAuth(user.id, company.id)

    const body = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: 1,
      status: 'active',
      folder_id: 1,
      last_modified: {
        between: {},
      },
      offset: 0,
    }

    await supertest(BASE_URL).post('/workspace/search').set('token', token).send(body).expect(422)

    await deleteAuth(token)
  })

  test('last_modifed between with dates passes validation', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const token = await makeAuth(user.id, company.id)

    const body: WorkSpaceSearchBody = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: 1,
      status: 'active',
      folder_id: 1,
      last_modified: {
        between: {
          after: DateTime.local().toISODate(),
          before: DateTime.local().toISODate(),
        },
      },
      page: 1,
      limit: 25,
    }

    await supertest(BASE_URL).post('/workspace/search').set('token', token).send(body).expect(200)

    await deleteAuth(token)
  })

  test('invalid access type fails validation', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const token = await makeAuth(user.id, company.id)

    const body = {
      filename: cuid(),
      search_type: 'simple',
      category: 'workgroup',
      category_id: 1,
      status: 'active',
      folder_id: 1,
      access: 'foo',
    }

    await supertest(BASE_URL).post('/workspace/search').set('token', token).send(body).expect(422)

    await deleteAuth(token)
  })

  test('recycle bin returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .createMany(3)

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
      status: 'trashed',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'trashed',
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      fileTypeId: fileType.id,
      lastAccessedById: user.id,
      status: 'trashed',
    }).createMany(3)

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: user.id,
      fileTypeId: fileType.id,
      lastAccessedById: user.id,
      status: 'trashed',
    }).createMany(2)

    const personalRoot = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    const personalFolderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: personalRoot.id,
      companyId: company.id,
      status: 'trashed',
    }).create()

    const personalFolderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: personalRoot.id,
      companyId: company.id,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: personalFolderA.id,
      fileTypeId: fileType.id,
      status: 'trashed',
    }).createMany(3)

    await PersonalFileFactory.merge({
      personalFolderId: personalFolderB.id,
      fileTypeId: fileType.id,
      status: 'trashed',
    }).createMany(2)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/workspace/recycle_bin/${caseInstance.id}`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.workGroupData.folders, 2)
        assert.lengthOf(res.body.workGroupData.trashedFolderfiles, 3)
        assert.lengthOf(res.body.workGroupData.activeFolderFiles, 2)

        assert.lengthOf(res.body.personalData.folders, 1)
        assert.lengthOf(res.body.personalData.trashedFolderfiles, 3)
        assert.lengthOf(res.body.personalData.activeFolderFiles, 2)
      })

    deleteAuth(token)
  })
})
