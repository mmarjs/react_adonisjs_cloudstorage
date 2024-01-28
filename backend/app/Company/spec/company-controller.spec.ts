import test from 'japa'
import supertest from 'supertest'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Env from '@ioc:Adonis/Core/Env'
import { CompanyFactory, RoleFactory, UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

const BASE_URL = Env.get('APP_URL')

test.group('Company Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('returns ok', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()

    const token = await makeAuth(role.user.id, company.id)

    await supertest(BASE_URL)
      .get(`/company/switch`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body, 1)
        assert.equal(res.body[0].name, company.name)
      })

    await deleteAuth(token)
  })

  test('empty roles returns ok with empty array', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()
    const user = await UserFactory.create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/company/switch`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body, 0)
        assert.isArray(res.body)
      })

    await deleteAuth(token)
  })

  test('updating name returns ok', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()

    const accountOwner = company.user
    const token = await makeAuth(accountOwner.id, company.id)

    await supertest(BASE_URL)
      .put(`/company/${company.id}/update`)
      .set('token', token)
      .send({
        name: 'foo',
      })
      .expect(200)
      .then((res) => {
        const data = res.body
        assert.equal(data.name, 'foo')
      })

    await deleteAuth(token)
  })

  test('requiring 2FA returns ok', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()
    const accountOwner = company.user

    const token = await makeAuth(accountOwner.id, company.id)

    await supertest(BASE_URL)
      .put(`/company/${company.id}/update`)
      .set('token', token)
      .send({
        isTwoFactorRequired: true,
      })
      .expect(200)
      .then((res) => {
        assert.isTrue(res.body.is_two_factor_required)
      })
    await deleteAuth(token)
  })

  test('removing 2FA requirement returns ok', async (assert) => {
    const company = await CompanyFactory.with('user', 1).apply('active').create()

    const accountOwner = company.user

    const token = await makeAuth(accountOwner.id, company.id)

    await supertest(BASE_URL)
      .put(`/company/${company.id}/update`)
      .set('token', token)
      .send({
        isTwoFactorRequired: false,
      })
      .expect(200)
      .then((res) => {
        assert.isFalse(res.body.is_two_factor_required)
      })
    await deleteAuth(token)
  })
})
