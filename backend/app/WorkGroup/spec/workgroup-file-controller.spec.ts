import test from 'japa'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import FileType from 'App/Models/FileType'
import WorkGroupFile from 'App/Models/WorkGroupFile'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import { randomBytes } from 'crypto'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Work Group File Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('/view with invalid folderId returns invalid-folder-id', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .get(`/workgroup/file/view/3434343/active/1/10`)
      .set('token', token)
      .expect(422)
      .then((res) => {
        assert.equal(res.body.error, 'invalid-folder-id')
      })

    deleteAuth(token)
  })

  test('/view with invalid status returns invalid-status', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    await supertest(BASE_URL)
      .get(`/workgroup/file/view/${root.id}/foo/1/10`)
      .set('token', token)
      .expect(422)
      .then((res) => {
        assert.equal(res.body.error, 'invalid-status')
      })

    deleteAuth(token)
  })

  test('/view with valid params returns all active files', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

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

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'active',
    }).create()

    const fileC = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/workgroup/file/view/${folderA.id}/active/1/10`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        const body = res.body.data as any[]
        const fileIds = body.map((b) => b.id)

        assert.lengthOf(body, 2)
        assert.isTrue(fileIds.includes(fileA.id))
        assert.isTrue(fileIds.includes(fileB.id))
        assert.isFalse(fileIds.includes(fileC.id))
      })

    deleteAuth(token)
  })

  test('moving files to a valid folder returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
    }).create()

    const fileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
    }).create()

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .post('/workgroup/file/move')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        fileIds: [fileA.id, fileB.id],
        nextFolderId: folderB.id,
      })
      .expect(200)

    await fileA.refresh()
    await fileB.refresh()

    assert.equal(fileA.workGroupFolderId, folderB.id)
    assert.equal(fileB.workGroupFolderId, folderB.id)

    deleteAuth(token)
  })

  test('renaming a folder returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
    }).create()

    const token = await makeAuth(company.user.id, company.id)

    const name = randomBytes(8).toString('hex')

    await supertest(BASE_URL)
      .post('/workgroup/file/rename')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        fileId: fileA.id,
        name: name,
      })
      .expect(200)

    await fileA.refresh()

    assert.equal(fileA.name, name)

    deleteAuth(token)
  })

  test('updating file status by id returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
    }).create()

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const files = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
      status: 'trashed',
    }).createMany(3)

    files.map((file) => assert.equal(file.status, 'trashed'))

    const fileIds = files.map((file) => file.id)

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .put('/workgroup/file/update')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        fileIds,
        status: 'active',
      })
      .expect(200)

    await WorkGroupFile.query().select('id', 'status').whereIn('id', fileIds)

    deleteAuth(token)
  })
})
