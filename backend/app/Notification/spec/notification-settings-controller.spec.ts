import test from 'japa'
import supertest from 'supertest'
import Role from 'App/Models/Role'
import Env from '@ioc:Adonis/Core/Env'
import SettingsMaker from 'App/Notification/SettingsMaker'
import NotificationSetting from 'App/Models/NotificationSetting'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import { CompanyFactory, UserFactory } from 'Database/factories'
import { EventName } from 'App/types'

const BASE_URL = Env.get('APP_URL')

test.group('Notification Settings Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('GET /notification_settings returns all notifications', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/notification_settings`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        const names = res.body.map((p) => p.event) as EventName[]
        assert.isAtLeast(14, names.length)
        assert.isTrue(names.some((n) => n === 'case-created'))
      })
    await deleteAuth(token)
  })

  test('PUT /notification_settings/:id/update returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const setting = await NotificationSetting.query()
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .firstOrFail()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/notification_settings/${setting.id}/update`)
      .set('token', token)
      .send({ column: 'sendApp', value: false })
      .expect(200)
      .then((res) => {
        assert.isFalse(res.body.sendApp)
      })

    await setting.refresh()
    assert.isFalse(Boolean(setting.sendApp))

    await deleteAuth(token)
  })
})
