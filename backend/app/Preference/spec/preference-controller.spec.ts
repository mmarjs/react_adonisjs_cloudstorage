import test from 'japa'
import supertest from 'supertest'
import Role from 'App/Models/Role'
import Env from '@ioc:Adonis/Core/Env'
import Preference from 'App/Models/Preference'
import PreferenceMaker from 'App/Preference/PreferenceMaker'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import { CompanyFactory, UserFactory } from 'Database/factories'
import { PreferenceName } from 'App/types'

const BASE_URL = Env.get('APP_URL')

test.group('Preference Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('GET / returns preferences', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const maker = new PreferenceMaker(user.id, company.id)
    await maker.make()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/preferences`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        const names = res.body.map((p) => p.name) as PreferenceName[]
        assert.lengthOf(names, 3)
        assert.isTrue(names.some((n) => n === 'collapse-main-menu-bar'))
        assert.isTrue(names.some((n) => n === 'hide-archived-cases'))
        assert.isTrue(names.some((n) => n === 'show-case-card-view'))
      })
    await deleteAuth(token)
  })

  test('PUT /preferences/:id/update returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const maker = new PreferenceMaker(user.id, company.id)
    await maker.make()

    const pref = await Preference.query()
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .firstOrFail()

    assert.isTrue(Boolean(pref.option))

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/preferences/${pref.id}/update`)
      .set('token', token)
      .send({ option: false })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.status, 'ok')
      })

    await pref.refresh()
    assert.isFalse(Boolean(pref.option))

    await deleteAuth(token)
  })
})
