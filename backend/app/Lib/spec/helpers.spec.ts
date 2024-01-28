import cuid from 'cuid'
import test from 'japa'
import Auth from 'App/Auth/Auth'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, ShareLinkFactory } from 'Database/factories'
import {
  getUserByToken,
  getShareLinkByToken,
  getShareLinkGrantorByToken,
  isStandardError,
  getItemReplacementList,
  isShareLinkUser,
} from 'App/Lib/Helpers'
import { Either } from 'App/types'

test.group('Helpers', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getUserByToken returns user', async (assert) => {
    const token = cuid()
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const auth = new Auth(token)
    const res = await auth.store(company.user.id, company.id)

    assert.isTrue(res)

    const fetchedUser = await getUserByToken(token)
    assert.equal(user.id, fetchedUser.id)
  })

  test('getUserByToken prevents non string input', async (assert) => {
    const token = undefined

    const res = await getUserByToken(token)
      .then((res) => {
        return res
      })
      .catch(() => false)

    assert.isFalse(res)
  })

  test('getShareLinkByToken returns shareLink', async (assert) => {
    const token = cuid()
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy', 1)
      .create()

    const auth = new Auth(token)
    const res = await auth.store(shareLink.grantedById, shareLink.companyId, shareLink.id)
    assert.isTrue(res)

    const fetchedLink = await getShareLinkByToken(token)
    assert.equal(fetchedLink.link, shareLink.link)
  })

  test('getShareLinkByToken prevents non string input', async (assert) => {
    const token = undefined

    const res = await getShareLinkByToken(token)
      .then((res) => {
        return res
      })
      .catch(() => false)

    assert.isFalse(res)
  })

  test('getShareLinkGrantorByToken returns shareLink', async (assert) => {
    const token = cuid()
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy', 1)
      .create()
    const grantorId = shareLink.grantedById

    const auth = new Auth(token)
    const res = await auth.store(shareLink.grantedById, shareLink.companyId, shareLink.id)

    assert.isTrue(res)

    const grantor = await getShareLinkGrantorByToken(token)
    assert.equal(grantor.id, grantorId)
  })

  test('isShareLinkUser returns true', async (assert) => {
    const token = cuid()
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const auth = new Auth(token)
    let res = await auth.store(user.id, company.id, 1)

    assert.isTrue(res)

    res = await isShareLinkUser(token)
    assert.isTrue(res)
  })

  test('isShareLinkUser returns false', async (assert) => {
    const token = cuid()
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const auth = new Auth(token)
    let res = await auth.store(user.id, company.id)

    assert.isTrue(res)

    res = await isShareLinkUser(token)
    assert.isFalse(res)
  })

  test('isStandardError returns true', async (assert) => {
    const obj: Either<boolean> = { error: 'some-error' }

    const res = isStandardError(obj)
    assert.isTrue(res)
  })

  test('isStandardError returns false', async (assert) => {
    const obj: Either<boolean> = { error: null, success: true }

    const res = isStandardError(obj)
    assert.isFalse(res)
  })

  test('getItemReplacementList returns correct subset', async (assert) => {
    const currentIds = [1, 2, 3, 4]
    const newIds = [2, 5, 6]

    const res = getItemReplacementList(currentIds, newIds)

    assert.deepEqual(res.itemsToDelete, [1, 3, 4])
    assert.deepEqual(res.itemsToAdd, [5, 6])
  })

  test('getItemReplacementList returns correct there is nothing to delete', async (assert) => {
    const currentIds = [1, 2, 3, 4]
    const newIds = [5]

    const res = getItemReplacementList(currentIds, newIds)

    assert.deepEqual(res.itemsToDelete, [1, 2, 3, 4])
    assert.deepEqual(res.itemsToAdd, [5])
  })

  test('getItemReplacementList returns correct there is nothing to add', async (assert) => {
    const currentIds = [1, 2, 3, 4]
    const newIds = []

    const res = getItemReplacementList(currentIds, newIds)

    assert.deepEqual(res.itemsToDelete, [])
    assert.deepEqual(res.itemsToAdd, [])
  })
})
