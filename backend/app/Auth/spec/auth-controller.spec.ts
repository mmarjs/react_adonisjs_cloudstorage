import cuid from 'cuid'
import test from 'japa'
import Chance from 'chance'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import Redis from '@ioc:Adonis/Addons/Redis'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Auth from 'App/Auth/Auth'
import {
  CompanyFactory,
  RoleFactory,
  PasswordResetFactory,
  UserFactory,
  ShareLinkFactory,
} from 'Database/factories'
import PasswordReset from 'App/Models/PasswordReset'

const BASE_URL = Env.get('APP_URL')
const chance = Chance.Chance()

test.group('AuthController', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('GET /auth_status returns token-type-error', async (assert) => {
    await supertest(BASE_URL)
      .get('/auth_status')
      .expect(422)
      .then((res) => {
        assert.equal(res.body.error, 'token-type-error')
      })
  })

  test('GET /auth_status returns failed-to-check-status', async (assert) => {
    await supertest(BASE_URL)
      .get('/auth_status')
      .set('token', cuid())
      .expect(400)
      .then((res) => {
        assert.equal(res.body.error, 'failed-to-check-status')
      })
  })

  test('GET /auth_status returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const token = await makeAuth(company.user.id, company.id)
    await supertest(BASE_URL)
      .get('/auth_status')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.status, 'ok')
      })

    await deleteAuth(token)
  })

  test('GET /auth_status refreshes ttl', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const token = await makeAuth(company.user.id, company.id)

    await Redis.expire(token, 10)
    const current = await Redis.ttl(token)
    assert.approximately(current, 10, 2)

    await supertest(BASE_URL)
      .get('/auth_status')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.status, 'ok')
      })

    const ttl = await Redis.ttl(token)
    assert.approximately(ttl, 3600, 4)

    await deleteAuth(token)
  })

  test('POST /reset_password resets the password', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()

    const user = role.user
    const originalPassword = user.password

    let reset = await PasswordResetFactory.merge({ userId: user.id }).create()
    const newPass = cuid()
    await supertest(BASE_URL)
      .post('/reset_password')
      .send({
        password: newPass,
        password_confirmation: newPass,
        token: reset.token,
      })
      .expect(200)

    await user.refresh()
    assert.notEqual(originalPassword, user.password)

    await reset.refresh()
    assert.equal(reset.used, true)
  })

  test('POST /reset_password returns a bad request', async (assert) => {
    /** rejects due to invalid token */
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const reset = await PasswordResetFactory.merge({ userId: user.id }).apply('used').create()
    const newPass = cuid()

    await supertest(BASE_URL)
      .post('/reset_password')
      .send({
        password: newPass,
        password_confirmation: newPass,
        token: reset.token,
      })
      .expect(400)
      .then((res) => {
        assert.equal(res.body.error, 'invalid-token')
      })
  })

  test('POST /reset_password returns a bad request', async (assert) => {
    /** Due to expired token */
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const reset = await PasswordResetFactory.merge({ userId: user.id }).apply('expired').create()
    const newPass = cuid()

    await supertest(BASE_URL)
      .post('/reset_password')
      .send({
        password: newPass,
        password_confirmation: newPass,
        token: reset.token,
      })
      .expect(400)
      .then((res) => {
        assert.equal(res.body.error, 'expired-token')
      })
  })

  test('POST /send_password_reset creates a reset', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()

    const user = role.user

    await supertest(BASE_URL)
      .post('/send_password_reset')
      .send({
        email: user.email,
      })
      .expect(200)

    const reset = await PasswordReset.findBy('user_id', user.id)
    assert.equal(reset?.userId, user.id)
    assert.equal(reset?.used, false)
  })

  test('POST /send_password_reset returns bad request', async () => {
    await supertest(BASE_URL)
      .post('/send_password_reset')
      .send({
        email: 'foo@gmail.com',
      })
      .expect(400)
  })

  test('POST /login process returns login data', async (assert) => {
    await supertest(BASE_URL)
      .post('/login')
      .send({
        action: 'validate-login',
        email: chance.email(),
        password: Env.get('TEST_PASSWORD'),
      })
      .expect(400)
      .then((res) => {
        assert.equal(res.body.error, 'no-such-account')
      })
  })

  test('POST /share_login returns share login', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const shareLink = await ShareLinkFactory.merge({ companyId: company.id })
      .with('grantedBy')
      .with('resources', 1, (q) => q.merge({ resource: 'work_group_files' }))
      .create()

    await supertest(BASE_URL)
      .post('/share_login')
      .send({
        email: shareLink.email,
        password: Env.get('TEST_PASSWORD'),
        link: shareLink.link,
      })
      .expect(200)
      .then((res) => {
        assert.isNotEmpty(res.body.token)
        assert.equal(res.body.shareLink.id, shareLink.id)

        deleteAuth(res.body.token).then(() => {})
      })
  })

  test('POST /logout performs user logout', async () => {
    const company = await CompanyFactory.with('user').create()

    const token = await makeAuth(company.user.id, company.id)
    await supertest(BASE_URL).post('/logout').set('token', token).expect(200)

    await deleteAuth(token)
  })

  test('POST /switch_company switches company', async (assert) => {
    const companyA = await CompanyFactory.with('user').create()
    const companyB = await CompanyFactory.with('user').create()

    const user = await UserFactory.create()

    await RoleFactory.merge({
      companyId: companyA.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      companyId: companyB.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    const token = await makeAuth(user.id, companyA.id)

    await supertest(BASE_URL)
      .post('/switch_company')
      .set('token', token)
      .send({
        companyId: companyB.id,
      })
      .expect(200)
      .then(async (res) => {
        const auth = new Auth(token)
        const fetchedToken = await auth.fetch()
        assert.equal(fetchedToken.companyId, companyB.id)

        deleteAuth(res.body.token).then(() => {})
      })
  })
})
