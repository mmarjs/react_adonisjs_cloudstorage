import test from 'japa'
import cuid from 'cuid'
import supertest from 'supertest'
import Env from '@ioc:Adonis/Core/Env'
import Redis from '@ioc:Adonis/Addons/Redis'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import { CompanyFactory } from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Auth Middleware', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('no token provided forbids access', async (assert) => {
    await supertest(BASE_URL)
      .get('/test_screen')
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'no-access-token')
      })
  })

  test('no token in redis returns cannot-fetch-token', async (assert) => {
    await supertest(BASE_URL)
      .get('/test_screen')
      .set('token', cuid())
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'cannot-fetch-token')
      })
  })

  test('an invalid header token forbids access', async (assert) => {
    const token = await makeAuth(55, 3434)
    await supertest(BASE_URL)
      .get('/test_screen')
      .set('token', token)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'invalid-access-token')
      })
  })

  test('an invalid query param token forbids access', async (assert) => {
    const token = await makeAuth(55, 3434)
    await supertest(BASE_URL)
      .get(`/test_screen?token=${token}`)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'invalid-access-token')
      })
  })

  test('a null query param token forbids access', async (assert) => {
    await supertest(BASE_URL)
      .get(`/test_screen?token=${null}`)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'cannot-fetch-token')
      })
  })

  test('an undefined query param token forbids access', async (assert) => {
    await supertest(BASE_URL)
      .get(`/test_screen?token=${undefined}`)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'cannot-fetch-token')
      })
  })

  test('a mismatched case query param token forbids access', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .get(`/test_screen?ToKen=${token}`)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'no-access-token')
      })

    await supertest(BASE_URL)
      .get(`/test_screen?jwt=${token}`)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'no-access-token')
      })

    await supertest(BASE_URL)
      .get(`/test_screen?Bearer=${token}`)
      .expect(401)
      .then((res) => {
        assert.equal(res.body.error, 'no-access-token')
      })
  })

  test('a valid header token allows access', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .get('/test_screen')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.message, 'You are logged in')
      })

    await deleteAuth(token)
  })

  test('a valid query param token allows access', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .get(`/test_screen?token=${token}`)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.message, 'You are logged in')
      })

    await deleteAuth(token)
  })

  test('an authenticated about to expire request updates the ttl', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const token = await makeAuth(company.user.id, company.id)

    await Redis.expire(token, 30)
    assert.approximately(await Redis.ttl(token), 30, 2)

    await supertest(BASE_URL)
      .get('/test_screen')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.message, 'You are logged in')
      })

    const latest = await Redis.ttl(token)
    assert.approximately(latest, 3600, 2)

    await deleteAuth(token)
  })
})
