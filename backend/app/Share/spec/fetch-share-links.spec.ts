import test from 'japa'
import cuid from 'cuid'
import Chance from 'chance'
import { DateTime } from 'luxon'
import FetchShareLinks from 'App/Share/FetchShareLinks'
import CreateShareLink from 'App/Share/CreateShareLink'
import Database from '@ioc:Adonis/Lucid/Database'
import { CreateShareLinkBody } from 'App/types'
import {
  CompanyFactory,
  CaseFactory,
  WorkGroupFolderFactory,
  PersonalFolderFactory,
  WorkGroupFileFactory,
  PersonalFileFactory,
} from 'Database/factories'

const chance = Chance.Chance()

test.group('FetchShareLinks', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('fetch returns links', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const grantor = company.user

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const caseId = caseInstance.id
    const userId = grantor.id

    const workGroupFolder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: grantor.id,
      parentId: 0,
      status: 'active',
    }).create()

    const workGroupFile = await WorkGroupFileFactory.merge({
      ownerId: grantor.id,
      workGroupFolderId: workGroupFolder.id,
      fileTypeId: 1,
      lastAccessedById: grantor.id,
      status: 'active',
    }).create()

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

    const workGroupShare: CreateShareLinkBody = {
      email: chance.email(),
      password: cuid(),
      subject: chance.sentence(),
      message: chance.paragraph(),
      identifier: cuid(),
      expiresAt: DateTime.local().toISO(),
      shareType: 'download',
      resource: 'work_group',
      folderId: workGroupFolder.id,
      items: [
        {
          resource: 'work_group_files',
          resourceId: workGroupFile.id,
        },
      ],
    }

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

    const fetchShareLinks = new FetchShareLinks(userId, company.id, caseId)
    const result = await fetchShareLinks.fetch()

    assert.equal(result[0].email, personalShare.email)
    assert.equal(result[1].email, workGroupShare.email)
  })

  test('fetch with invalid params returns empty array', async (assert) => {
    const userId = chance.integer({ min: 1, max: 100 })
    const caseId = chance.integer({ min: 1, max: 100 })

    const fetchShareLinks = new FetchShareLinks(userId, userId, caseId)
    const result = await fetchShareLinks.fetch()

    assert.isArray(result)
    assert.lengthOf(result, 0)
  })
})
