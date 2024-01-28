import test from 'japa'
import cuid from 'cuid'
import supertest from 'supertest'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'
import ZipBuild from 'App/Models/ZipBuild'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Database from '@ioc:Adonis/Lucid/Database'
import { ActiveFileParams } from 'App/types'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import {
  CompanyFactory,
  PersonalFileFactory,
  CaseFactory,
  UserFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
  PersonalFolderFactory,
} from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Files Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('download file url returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const file = await PersonalFileFactory.merge({ fileTypeId: 1 })
      .with('folder', 1, (q) => q.merge({ userId: user.id, companyId: company.id }))
      .create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/files/download_file`)
      .set('token', token)
      .send({
        resource: 'personal',
        id: file.id,
      })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.filename, file.name)
        assert.isNotEmpty(res.body.url)
      })

    await deleteAuth(token)
  })

  test('invalid resource returns 422', async () => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const file = await PersonalFileFactory.merge({ fileTypeId: 1 })
      .with('folder', 1, (q) => q.merge({ userId: user.id, companyId: company.id }))
      .create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/files/download_file`)
      .set('token', token)
      .send({
        resource: 'foo',
        resourceId: file.id,
      })
      .expect(422)

    await deleteAuth(token)
  })

  test('test build_zip workgroup top level files', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'grant', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'trash', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: 0,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const workGroupFileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      lastAccessedById: user.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const workGroupFileB = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: user.id,
      lastAccessedById: user.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/files/build_zip`)
      .set('token', token)
      .send({
        resource: 'workgroup',
        resourceId: caseInstance.id,
        parentId: folderA.id,
        folders: [],
        files: [workGroupFileA.id, workGroupFileB.id],
      })
      .expect(200)
      .then(async (res) => {
        const url = new URL(res.body.success.link)
        const segements = url.pathname.split('/')
        const link = segements[2]
        const build = await ZipBuild.findByOrFail('link', link)
        assert.lengthOf(build.output.files, 2)
      })

    await deleteAuth(token)
  })

  test('test build_zip workgroup nested folders', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'grant', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'trash', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: 0,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const folderB = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const folderC = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: folderB.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderC.id,
      ownerId: user.id,
      lastAccessedById: user.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const folderD = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: folderC.id,
      status: 'active',
    }).create()

    const folderE = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: folderD.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: folderE.id,
      ownerId: user.id,
      lastAccessedById: user.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
      parentId: folderD.id,
      status: 'active',
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/files/build_zip`)
      .set('token', token)
      .send({
        resource: 'workgroup',
        resourceId: caseInstance.id,
        parentId: folderA.id,
        folders: [folderB.id],
        files: [],
      })
      .expect(200)
      .then(async (res) => {
        const url = new URL(res.body.success.link)
        const segements = url.pathname.split('/')
        const link = segements[2]
        const build = await ZipBuild.findByOrFail('link', link)
        assert.lengthOf(build.output.folders, 5)
      })

    await deleteAuth(token)
  })

  test('test build_zip personal top level files', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
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

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/files/build_zip`)
      .set('token', token)
      .send({
        resource: 'personal',
        resourceId: user.id,
        parentId: root.id,
        folders: [],
        files: [fileA.id, fileB.id],
      })
      .expect(200)
      .then(async (res) => {
        const url = new URL(res.body.success.link)
        const segements = url.pathname.split('/')
        const link = segements[2]
        const build = await ZipBuild.findByOrFail('link', link)
        assert.lengthOf(build.output.files, 2)
      })

    await deleteAuth(token)
  })

  test('test build_zip personal nested folders', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
      status: 'active',
    }).create()

    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const folderB = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: root.id,
      status: 'active',
    }).create()

    const folderC = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderB.id,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderC.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const folderD = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderC.id,
      status: 'active',
    }).create()

    const folderE = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderD.id,
      status: 'active',
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: folderE.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: folderD.id,
      status: 'active',
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/files/build_zip`)
      .set('token', token)
      .send({
        resource: 'personal',
        resourceId: user.id,
        parentId: folderA.id,
        folders: [folderB.id],
        files: [],
      })
      .expect(200)
      .then(async (res) => {
        const url = new URL(res.body.success.link)
        const segements = url.pathname.split('/')
        const link = segements[2]
        const build = await ZipBuild.findByOrFail('link', link)
        assert.lengthOf(build.output.folders, 5)
      })

    await deleteAuth(token)
  })

  test('createsFiles dispatches job', async () => {
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

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL).post('/files/create').set('token', token).send(params).expect(200)

    deleteAuth(token)
  })

  test('delete_trash returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'grant', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'trash', 'case', caseInstance.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: user.id,
      status: 'trashed',
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      ownerId: company.user.id,
      fileTypeId: 1,
      lastAccessedById: company.user.id,
      status: 'trashed',
      name: 'abc.jpeg',
      access: 'shared',
      size: 4000,
    }).create()

    const fileId = file.id

    const token = await makeAuth(user.id, company.id)
    await supertest(BASE_URL)
      .post('/files/delete_trash')
      .set('token', token)
      .send({
        id: fileId,
        type: 'file',
        category: 'workgroup',
      })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.status, 'ok')
      })

    await deleteAuth(token)
  })
})
