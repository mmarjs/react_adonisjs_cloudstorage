import test from 'japa'
import cuid from 'cuid'
import { randomBytes } from 'crypto'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import FileType from 'App/Models/FileType'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Work Group Folder Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('/directory returns 200 and correct data', async (assert) => {
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

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
      status: 'active',
    }).create()

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .post(`/workgroup/folder/directory`)
      .set('token', token)
      .send({
        folderId: folderA.id,
        status: 'active',
      })
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.folders, 1)
        assert.lengthOf(res.body.files.data, 1)
        assert.equal(res.body.folders[0].id, folderB.id)
        assert.equal(res.body.files.data[0].id, fileA.id)
      })

    deleteAuth(token)
  })

  test('/create returns 200 and creates a folder', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const folderName = cuid()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post('/workgroup/folder/create')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        parentId: root.id,
        name: folderName,
      })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.parent_id, root.id)
        assert.equal(res.body.status, 'active')
      })

    await deleteAuth(token)
  })

  test('/move returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
    }).create()

    await Permission.addPermission(company.user.id, company.id, 'write', 'case', caseInstance.id)

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

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .post('/workgroup/folder/move')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        folderId: folderA.id,
        newParentId: folderB.id,
      })
      .expect(200)

    await folderA.refresh()

    assert.equal(folderA.parentId, folderB.id)

    deleteAuth(token)
  })

  test('/rename returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Permission.addPermission(company.user.id, company.id, 'write', 'case', caseInstance.id)

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

    const token = await makeAuth(company.user.id, company.id)

    const name = randomBytes(8).toString('hex')

    await supertest(BASE_URL)
      .post('/workgroup/folder/rename')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        folderId: folderA.id,
        name: name,
      })
      .expect(200)

    await folderA.refresh()

    assert.equal(folderA.name, name)

    deleteAuth(token)
  })

  test('/update returns 200 and upates status in tree', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Permission.addPermission(company.user.id, company.id, 'write', 'case', caseInstance.id)

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

    assert.equal(folderA.status, 'pending')

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderA.id,
      ownerId: company.user.id,
    }).create()

    assert.equal(folderB.status, 'pending')

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: folderB.id,
      ownerId: company.user.id,
    }).create()

    assert.equal(folderC.status, 'pending')

    const fileType = await FileType.findByOrFail('name', 'MS Word')

    const fileAA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    assert.equal(fileAA.status, 'pending')

    const fileAB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    assert.equal(fileAB.status, 'pending')

    const fileBA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    assert.equal(fileBA.status, 'pending')

    const fileBB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderB.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    assert.equal(fileBB.status, 'pending')

    const fileCA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderC.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    assert.equal(fileCA.status, 'pending')

    const fileCB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderC.id,
      ownerId: company.user.id,
      fileTypeId: fileType.id,
      lastAccessedById: company.user.id,
    }).create()

    assert.equal(fileCB.status, 'pending')

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .put('/workgroup/folder/update')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        folderId: folderA.id,
        status: 'active',
      })
      .expect(200)

    await folderA.refresh()

    assert.equal(folderA.status, 'active')

    await folderB.refresh()

    assert.equal(folderB.status, 'active')

    await folderC.refresh()

    assert.equal(folderC.status, 'active')

    await fileAA.refresh()
    await fileAB.refresh()

    assert.equal(fileAA.status, 'active')
    assert.equal(fileAB.status, 'active')

    await fileBA.refresh()
    await fileBB.refresh()

    assert.equal(fileBA.status, 'active')
    assert.equal(fileBB.status, 'active')

    await fileCA.refresh()
    await fileCB.refresh()

    assert.equal(fileCA.status, 'active')
    assert.equal(fileCB.status, 'active')

    deleteAuth(token)
  })

  test('/update returns prevents duplicate folder on restore', async (assert) => {
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
      status: 'trashed',
      name: 'foobar',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
      name: 'foobar',
    }).create()

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .put('/workgroup/folder/update')
      .set('token', token)
      .send({
        caseId: caseInstance.id,
        folderId: folderA.id,
        status: 'active',
      })
      .expect(200)

    await folderA.refresh()

    assert.equal(folderA.status, 'active')
    assert.equal(folderA.name, 'foobar (1)')

    await folderB.refresh()

    assert.equal(folderB.status, 'active')
    assert.equal(folderB.name, 'foobar')

    deleteAuth(token)
  })
})
