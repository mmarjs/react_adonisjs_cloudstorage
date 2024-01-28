import test from 'japa'
import supertest from 'supertest'
import Role from 'App/Models/Role'
import Env from '@ioc:Adonis/Core/Env'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import { CompanyFactory, UserFactory, EventFactory, NotificationFactory } from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Notification Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('GET /notifications returns all notifications', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const eventA = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-created',
    }).create()

    const eventB = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-archived',
    }).create()

    const notificationA = await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventA.id,
      dismissedAt: null,
    }).create()

    const notificationB = await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventB.id,
      dismissedAt: null,
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/notifications`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body, 2)
        assert.isTrue(res.body.some((n) => n.id === notificationA.id))
        assert.isTrue(res.body.some((n) => n.id === notificationB.id))
      })
    await deleteAuth(token)
  })

  test('PUT /notifications/:id/dismiss returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-created',
    }).create()

    const notification = await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: event.id,
    }).create()

    assert.isNull(notification.dismissedAt)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/notifications/${notification.id}/dismiss`)
      .set('token', token)
      .expect(200)

    await notification.refresh()
    assert.isNotNull(notification.dismissedAt)

    await deleteAuth(token)
  })

  test('PUT /notifications/dismiss_all returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const eventA = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-created',
    }).create()

    const eventB = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-archived',
    }).create()

    await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventA.id,
      dismissedAt: null,
    }).create()

    await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventB.id,
      dismissedAt: null,
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL).put(`/notifications/dismiss_all`).set('token', token).expect(200)

    const count = await Notification.query()
      .count('id as total')
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .whereNull('dismissed_at')
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(count.total, 0)

    await deleteAuth(token)
  })
})
