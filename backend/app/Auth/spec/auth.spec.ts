import cuid from 'cuid'
import test from 'japa'
import Auth from 'App/Auth/Auth'
import Redis from '@ioc:Adonis/Addons/Redis'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import ShareLink from 'App/Models/ShareLink'
import { UserFactory, CompanyFactory, ShareLinkFactory } from 'Database/factories'

test.group('Auth Library', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('store returns true', async (assert) => {
    const token = cuid()
    const user = await UserFactory.create()
    const company = await CompanyFactory.with('user').create()
    const auth = new Auth(token)

    const returnValue = await auth.store(user.id, company.id)
    assert.isTrue(returnValue)

    const keyExists = await Redis.exists(token)
    assert.equal(keyExists, 1)

    const storedValue = (await Redis.get(token)) as string
    assert.isNotNull(storedValue)

    const data = JSON.parse(storedValue)

    assert.equal(data?.userId, user.id)

    await Redis.del(token)
  })

  test('getUser returns user', async (assert) => {
    const token = cuid()
    const user = await UserFactory.create()
    const company = await CompanyFactory.with('user').create()
    const auth = new Auth(token)

    await auth.store(user.id, company.id)

    const authUser = await auth.getUser()

    assert.equal(authUser?.id, user.id)
    assert.isTrue(authUser instanceof User)
    await Redis.del(token)
  })

  test('getShareLink returns ShareLink', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .create()
    const token = cuid()
    const auth = new Auth(token)

    await auth.store(shareLink.grantedById, shareLink.companyId, shareLink.id)

    const res = await auth.getShareLink()

    assert.equal(res?.link, shareLink.link)
    assert.isTrue(res instanceof ShareLink)
    await Redis.del(token)
  })

  test('check returns true when valid', async (assert) => {
    const token = cuid()
    const user = await UserFactory.create()
    const company = await CompanyFactory.with('user').create()
    const auth = new Auth(token)

    await auth.store(user.id, company.id)
    const isAuthenticated = await auth.check()

    assert.isTrue(isAuthenticated)
    await Redis.del(token)
  })

  test('switchCompany returns true', async (assert) => {
    const token = cuid()
    const user = await UserFactory.create()
    const companyA = await CompanyFactory.with('user').create()
    const auth = new Auth(token)

    await auth.store(user.id, companyA.id)

    const fetchedTokenA = await auth.fetch()

    assert.equal(fetchedTokenA.companyId, companyA.id)

    const companyB = await CompanyFactory.with('user').create()

    const res = await auth.switchCompany(companyB.id)
    assert.isTrue(res)

    const fetchedTokenB = await auth.fetch()

    assert.equal(fetchedTokenB.companyId, companyB.id)

    await Redis.del(token)
  })

  test('delete removes the item', async (assert) => {
    const token = cuid()
    const user = await UserFactory.create()
    const company = await CompanyFactory.with('user').create()
    const auth = new Auth(token)
    await auth.store(user.id, company.id)

    const keyExists = await Redis.exists(token)
    assert.equal(keyExists, 1)

    await auth.delete()

    const verifyDeleted = await Redis.exists(token)
    assert.equal(verifyDeleted, 0)
  })

  test('refreshTtl and non impersating user refreshes to 3600', async (assert) => {
    const token = cuid()
    const user = await UserFactory.create()
    const company = await CompanyFactory.with('user').create()
    const auth = new Auth(token)

    await auth.store(user.id, company.id)
    assert.approximately(await Redis.ttl(token), 3600, 2)

    await Redis.expire(token, 10)
    assert.approximately(await Redis.ttl(token), 10, 2)

    await auth.refreshTtl()

    assert.approximately(await Redis.ttl(token), 3600, 2)
    await Redis.del(token)
  })
})
