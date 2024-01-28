import test from 'japa'
import cuid from 'cuid'
import Chance from 'chance'
import { DateTime } from 'luxon'
import ShareLink from 'App/Models/ShareLink'
import ShareResource from 'App/Models/ShareResource'
import Database from '@ioc:Adonis/Lucid/Database'
import { CreateShareLinkBody } from 'App/types'
import {
  CaseFactory,
  CompanyFactory,
  WorkGroupFileFactory,
  WorkGroupFolderFactory,
} from 'Database/factories'
import CreateShareLink from 'App/Share/CreateShareLink'

const chance = Chance.Chance()

test.group('Create Share Link', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('createShareLink with download stores items', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const grantor = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const root = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
    }).create()

    const body: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'download',
      resource: 'work_group',
      folderId: root.id,
      canUpdatePassword: true,
      canTrash: true,
      items: [
        {
          resource: 'work_group_files',
          resourceId: chance.integer({ min: 1, max: 100 }),
        },
        {
          resource: 'work_group_files',
          resourceId: chance.integer({ min: 1, max: 100 }),
        },
        {
          resource: 'work_group_files',
          resourceId: chance.integer({ min: 1, max: 100 }),
        },
      ],
    }

    const createShareLink = new CreateShareLink(grantor.id, company.id, body)
    const shareLink = await createShareLink.create()
    assert.isNotEmpty(shareLink)
    assert.isTrue(shareLink.canUpdatePassword)
    assert.isTrue(shareLink.canTrash)

    const resources = await ShareResource.query().where('share_link_id', shareLink.id)

    assert.equal((shareLink as ShareLink).email, body.email)
    assert.lengthOf(resources, 3)
  })

  test('createShareLink with upload does not store items', async (assert) => {
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
      canUpdatePassword: true,
      canTrash: true,
      items: [
        {
          resource: 'work_group_files',
          resourceId: fileA.id,
        },
      ],
    }

    const createShareLink = new CreateShareLink(grantor.id, company.id, body)
    const shareLink = await createShareLink.create()

    assert.isNotEmpty(shareLink)
    assert.isTrue(shareLink.canUpdatePassword)
    assert.isTrue(shareLink.canTrash)

    const resources = await ShareResource.query().where('share_link_id', shareLink.id)

    assert.equal((shareLink as ShareLink).email, body.email)
    assert.lengthOf(resources, 0)
    assert.equal(shareLink.folderId, body.folderId)
  })

  test(' stores items', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const grantor = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const workGroupFolder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
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
      folderId: workGroupFolder.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: chance.integer({ min: 1, max: 100 }),
        },
        {
          resource: 'work_group_files',
          resourceId: chance.integer({ min: 1, max: 100 }),
        },
        {
          resource: 'work_group_files',
          resourceId: chance.integer({ min: 1, max: 100 }),
        },
      ],
    }

    const createShareLink = new CreateShareLink(grantor.id, company.id, body)
    const shareLink = await createShareLink.create()

    assert.isNotEmpty(shareLink)
  })
})
