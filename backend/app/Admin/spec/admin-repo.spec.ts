import test from 'japa'
import cuid from 'cuid'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import { getCompanyUserByToken } from 'App/Lib/Helpers'
import { isValidPassword, impersonate } from 'App/Admin/AdminRepo'
import { AdminFactory, CompanyFactory } from 'Database/factories'

test.group('Admin Repo', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('isValidPassword returns true', async (assert) => {
    const admin = await AdminFactory.create()

    const res = await isValidPassword(admin, Env.get('TEST_PASSWORD'))

    assert.isTrue(res)
  })

  test('isValidPassword returns false', async (assert) => {
    const admin = await AdminFactory.create()

    const res = await isValidPassword(admin, cuid())

    assert.isFalse(res)
  })

  test('impersonate returns token', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const token = await impersonate(user.id, company.id)
    assert.isAtLeast(token.length, 16)

    const { user: fetchedUser, company: fetchedCompany } = await getCompanyUserByToken(token)

    assert.equal(company.id, fetchedCompany.id)
    assert.equal(user.id, fetchedUser.id)
  })
})
