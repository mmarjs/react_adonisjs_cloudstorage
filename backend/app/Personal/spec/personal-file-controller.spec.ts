import test from 'japa'
import cuid from 'cuid'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import PersonalFile from 'App/Models/PersonalFile'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, PersonalFolderFactory, PersonalFileFactory } from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Personal File Controller', (group) => {
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
      .get(`/personal/file/view/3434343/active/1/10`)
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

    const root = await PersonalFolderFactory.merge({
      userId: company.user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    await supertest(BASE_URL)
      .get(`/personal/file/view/${root.id}/foo/1/10`)
      .set('token', token)
      .expect(422)
      .then((res) => {
        assert.equal(res.body.error, 'invalid-status')
      })

    deleteAuth(token)
  })

  test('/view with valid params returns all active files', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    const root = await PersonalFolderFactory.merge({
      userId: company.user.id,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const fileC = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      fileTypeId: 1,
      status: 'trashed',
    }).create()

    await supertest(BASE_URL)
      .get(`/personal/file/view/${root.id}/active/1/10`)
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

  test('/move files to a valid folder returns 200', async (assert) => {
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
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      name: cuid(),
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
    }).create()

    const fileB = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
    }).create()

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .post('/personal/file/move')
      .set('token', token)
      .send({
        userId: user.id,
        fileIds: [fileA.id, fileB.id],
        nextFolderId: folderB.id,
      })
      .expect(200)

    await fileA.refresh()
    await fileB.refresh()

    assert.equal(fileA.personalFolderId, folderB.id)
    assert.equal(fileB.personalFolderId, folderB.id)

    deleteAuth(token)
  })

  test('/rename a folder returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
      name: cuid(),
    }).create()

    const fileA = await PersonalFileFactory.merge({
      personalFolderId: root.id,
      name: cuid(),
      fileTypeId: 1,
    }).create()

    const token = await makeAuth(company.user.id, company.id)

    const name = cuid()

    await supertest(BASE_URL)
      .post('/personal/file/rename')
      .set('token', token)
      .send({
        userId: user.id,
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
    }).create()

    const files = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      name: cuid(),
      fileTypeId: 1,
    }).createMany(3)

    files.map((file) => assert.equal(file.status, 'pending'))

    const fileIds = files.map((file) => file.id)

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .put('/personal/file/update')
      .set('token', token)
      .send({
        fileIds,
        status: 'active',
      })
      .expect(200)

    const updatedFiles = await PersonalFile.query().select('id', 'status').whereIn('id', fileIds)

    updatedFiles.map((file) => assert.equal(file.status, 'active'))
    deleteAuth(token)
  })
})
