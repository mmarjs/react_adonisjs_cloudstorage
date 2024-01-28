import test from 'japa'
import Chance from 'chance'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import handleShareLogin from 'App/Auth/HandleShareLogin'
import { DateTime } from 'luxon'
import { ShareLoginInput } from 'App/types'
import { CompanyFactory, ShareLinkFactory } from 'Database/factories'

const chance = Chance.Chance()

test.group('AuthController', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handleShareLogin returns token', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
    }

    const { success } = await handleShareLogin(params)

    assert.isNotEmpty(success?.token)
    assert.equal(success?.shareLink.id, shareLink.id)
  })

  test('handleShareLogin returns share-link-deleted', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({
      companyId: company.id,
      deletedAt: DateTime.local().minus({ months: 1 }),
    })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
    }

    const { error } = await handleShareLogin(params)

    assert.equal(error, 'share-link-deleted')
  })

  test('handleShareLogin returns share-link-expired', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({
      companyId: company.id,
      expiresAt: DateTime.local().minus({ months: 1 }),
    })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
    }

    const { error } = await handleShareLogin(params)

    assert.equal(error, 'share-link-expired')
  })

  test('handleShareLogin updates last login date', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
    }

    const { success } = await handleShareLogin(params)

    assert.isNotEmpty(success?.token)
    assert.isNotNull(success?.shareLink.lastLogin)
  })

  test('handleShareLogin first name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const originalFirstName = shareLink.firstName

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
      firstName: chance.first(),
    }

    const { success } = await handleShareLogin(params)

    await shareLink.refresh()

    assert.notEqual(success?.shareLink.firstName, originalFirstName)
  })

  test('handleShareLogin saves last name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const originalLastName = shareLink.lastName

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
      lastName: chance.last(),
    }

    const { success } = await handleShareLogin(params)

    assert.notEqual(success?.shareLink.lastName, originalLastName)
  })

  test('handleSharedLogin saves phone', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const originalPhone = shareLink.phone

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
      phone: chance.phone(),
    }

    const { success } = await handleShareLogin(params)

    await shareLink.refresh()

    assert.notEqual(success?.shareLink.phone, originalPhone)
  })

  test('handleShareLogin saves company name', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    const originalCompanyName = shareLink.companyName

    const params: ShareLoginInput = {
      email: shareLink.email,
      password: Env.get('TEST_PASSWORD'),
      link: shareLink.link,
      companyName: chance.name(),
    }

    const { success } = await handleShareLogin(params)

    await shareLink.refresh()

    assert.notEqual(success?.shareLink.companyName, originalCompanyName)
  })
})
