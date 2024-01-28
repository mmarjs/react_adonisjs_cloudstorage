import test from 'japa'
import cuid from 'cuid'
import Chance from 'chance'
import supertest from 'supertest'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CaseFactory,
  CompanyFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
  WorkGroupFileFactory,
  WorkGroupFolderFactory,
  ShareLinkFactory,
  ShareResourceFactory,
  RoleFactory,
} from 'Database/factories'
import CreateShareLink from 'App/Share/CreateShareLink'
import { CreateShareLinkBody } from 'App/types'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'

const chance = Chance.Chance()
const BASE_URL = Env.get('APP_URL')

test.group('Share Link Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('create share link action returns link', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: user.id,
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: folder.id,
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    const body: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      identifier: cuid(),
      subject: chance.word(),
      message: chance.word(),
      canUpdatePassword: true,
      expiresAt: DateTime.local().toISO(),
      shareType: 'upload',
      resource: 'work_group',
      folderId: folder.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: file.id,
        },
      ],
    }

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post('/share/create_link')
      .set('token', token)
      .send(body)
      .expect(200)
      .then((res) => {
        assert.isNotEmpty(res.body)
        assert.isTrue(res.body.can_update_password)
      })

    await deleteAuth(token)
  })

  test('validates items array', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const body: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      identifier: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'upload',
      resource: 'work_group',
      folderId: chance.integer({ min: 1, max: 100 }),
      items: [],
    }

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL).post('/share/create_link').set('token', token).send(body).expect(422)

    await deleteAuth(token)
  })

  test('getShareLinks returns links', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const grantor = company.user
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const caseId = caseInstance.id
    const userId = grantor.id

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: userId,
      parentId: 0,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: userId,
      parentId: root.id,
      status: 'active',
    }).create()

    const workGroupFile = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      ownerId: userId,
      lastAccessedById: userId,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const workGroupShare: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'download',
      resource: 'work_group',
      folderId: root.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: workGroupFile.id,
        },
      ],
    }

    const personalFolder = await PersonalFolderFactory.merge({
      userId: userId,
      parentId: 0,
      companyId: company.id,
      status: 'active',
    }).create()

    const personalFile = await PersonalFileFactory.merge({
      personalFolderId: personalFolder.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    const personalShare: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'download',
      resource: 'personal',
      folderId: personalFolder.id,
      items: [
        {
          resource: 'personal_files',
          resourceId: personalFile.id,
        },
      ],
    }

    const createLinkA = new CreateShareLink(grantor.id, company.id, workGroupShare)
    const workGroupLinks = await createLinkA.create()

    assert.isNotEmpty(workGroupLinks)

    const createLinkB = new CreateShareLink(grantor.id, company.id, personalShare)
    const personalShareLinks = await createLinkB.create()

    assert.isNotEmpty(personalShareLinks)

    const token = await makeAuth(grantor.id, company.id)

    await supertest(BASE_URL)
      .get(`/share/fetch_shared_links?user_id=${userId}&case_id=${caseId}`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body, 2)
      })

    await deleteAuth(token)
  })

  test('/share/data/:link with download and work_group returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const folderA = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: root.id,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const file = await WorkGroupFileFactory.merge({
      workGroupFolderId: folderA.id,
      fileTypeId: 1,
      ownerId: user.id,
      lastAccessedById: user.id,
      status: 'active',
    }).create()

    const shareLink = await ShareLinkFactory.with('grantedBy', 1)
      .merge({
        resource: 'work_group',
        folderId: root.id,
        shareType: 'download',
        companyId: company.id,
      })
      .create()

    const sharedFile = await ShareResourceFactory.merge({
      shareLinkId: shareLink.id,
      resource: 'work_group_files',
      resourceId: file.id,
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/share/data/${shareLink.link}`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.files, 1)
        assert.equal(res.body.files[0].id, sharedFile.resourceId)
      })

    await deleteAuth(token)
  })

  test('/share/data/:link with upload and work_group returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      parentId: 0,
      ownerId: company.user.id,
      status: 'active',
    }).create()

    const shareLink = await ShareLinkFactory.with('grantedBy', 1)
      .merge({
        resource: 'work_group',
        folderId: root.id,
        shareType: 'upload',
        companyId: company.id,
      })
      .create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/share/data/${shareLink.link}`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.files, 0)
      })

    await deleteAuth(token)
  })

  test('/share/data/:link with download personal returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user

    const root = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: 0,
      companyId: company.id,
    }).create()
    const folderA = await PersonalFolderFactory.merge({
      userId: user.id,
      parentId: root.id,
      companyId: company.id,
      status: 'active',
    }).create()

    const file = await PersonalFileFactory.merge({
      personalFolderId: folderA.id,
      fileTypeId: 1,
      status: 'active',
    }).create()

    assert.isNotEmpty(file)

    const shareLink = await ShareLinkFactory.with('grantedBy', 1)
      .merge({
        resource: 'personal',
        folderId: root.id,
        shareType: 'download',
        companyId: company.id,
      })
      .create()

    await ShareResourceFactory.merge({
      shareLinkId: shareLink.id,
      resource: 'personal_files',
      resourceId: file.id,
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/share/data/${shareLink.link}`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.files, 1)
      })

    await deleteAuth(token)
  })

  test('invalid share link returns no-share-link-exists', async (assert) => {
    const link = cuid()
    await supertest(BASE_URL)
      .get(`/share/link_status/${link}`)
      .expect(422)
      .then((res) => {
        assert.equal(res.body.error, 'no-share-link-exists')
      })
  })

  test('expired share link returns link-is-expired', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const twoWeeksAgo = DateTime.local().minus({ weeks: 2 })
    const shareLink = await ShareLinkFactory.merge({
      expiresAt: twoWeeksAgo,
      companyId: company.id,
    })
      .with('grantedBy')
      .create()

    await supertest(BASE_URL)
      .get(`/share/link_status/${shareLink.link}`)
      .expect(400)
      .then((res) => {
        assert.equal(res.body.error, 'link-is-expired')
      })
  })

  test('valid share link returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (u) => u).create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .create()

    const user = role.user

    const twoWeeksHence = DateTime.local().plus({ weeks: 2 })
    const shareLink = await ShareLinkFactory.merge({
      grantedById: user.id,
      companyId: company.id,
      expiresAt: twoWeeksHence,
    }).create()

    await supertest(BASE_URL)
      .get(`/share/link_status/${shareLink.link}`)
      .expect(200)
      .then((res) => {
        assert.isNotEmpty(res.body.grantor)
        assert.isNotEmpty(res.body.company)
        assert.isNotEmpty(res.body.expiration)
      })
  })

  test('delete share link action returns 204', async () => {
    const company = await CompanyFactory.with('user').create()
    const grantor = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: grantor.id,
      lastAccessedById: grantor.id,
    }).create()

    const body: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'upload',
      resource: 'work_group',
      folderId: root.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: fileA.id,
        },
      ],
    }

    const createShareLink = new CreateShareLink(grantor.id, company.id, body)
    const link = await createShareLink.create()

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .delete(`/share/delete_link/${link.id}`)
      .set('token', token)
      .expect(204)

    await deleteAuth(token)
  })

  test('update share link action updates expiry', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const grantor = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: grantor.id,
      lastAccessedById: grantor.id,
    }).create()

    const body: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'upload',
      resource: 'work_group',
      folderId: root.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: fileA.id,
        },
      ],
    }

    const createShareLink = new CreateShareLink(grantor.id, company.id, body)
    const link = await createShareLink.create()

    const currentExpiration = link.expiresAt

    const token = await makeAuth(link.grantedById, link.companyId, link.id)

    await supertest(BASE_URL)
      .put(`/share/update_link/${link.id}`)
      .set('token', token)
      .send({ expiry: DateTime.local().plus({ years: 1 }).toISO() })
      .expect(204)

    await link.refresh()
    assert.notEqual(currentExpiration, link.expiresAt)
    await deleteAuth(token)
  })

  test('update share link action updates user password', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const grantor = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
    }).create()

    const fileA = await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      ownerId: grantor.id,
      lastAccessedById: grantor.id,
    }).create()

    const body: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'upload',
      resource: 'work_group',
      folderId: root.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: fileA.id,
        },
      ],
    }

    const createShareLink = new CreateShareLink(grantor.id, company.id, body)
    const link = await createShareLink.create()

    const currentPassword = link.password

    const token = await makeAuth(link.grantedById, link.companyId, link.id)

    await supertest(BASE_URL)
      .put(`/share/update_link/${link.id}`)
      .set('token', token)
      .send({ password: 'whatever' })
      .expect(204)

    await link.refresh()

    assert.notEqual(currentPassword, link.password)

    await deleteAuth(token)
  })
})
