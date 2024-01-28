import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import {
  CompanyFactory,
  UserFactory,
  CaseFactory,
  EventFactory,
  NotificationFactory,
} from 'Database//factories'
import { DateTime } from 'luxon'

test.group('Notification Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('userNotifications returns all undismissed notifications', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
    }).create()

    const notification = await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: event.id,
      dismissedAt: null,
    }).create()

    const notifications = await Notification.userNotifications(user.id, company.id, [
      'id',
      'event_id',
      'message',
    ])
    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.id === notification.id))
    assert.isTrue(notifications.some((n) => n.eventId === event.id))
  })

  test('userNotifications does not return dismissed notificaton', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const eventA = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
    }).create()

    const eventB = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
    }).create()

    const notificationA = await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventA.id,
      dismissedAt: DateTime.local(),
    }).create()

    const notificationB = await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventB.id,
      dismissedAt: null,
    }).create()

    const notifications = await Notification.userNotifications(user.id, company.id, [
      'id',
      'event_id',
      'message',
    ])

    assert.lengthOf(notifications, 1)

    assert.isFalse(notifications.some((n) => n.id === notificationA.id))
    assert.isTrue(notifications.some((n) => n.id === notificationB.id))
  })

  test('userNotifications returns none with only dismissed exist', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const eventA = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
    }).create()

    const eventB = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
    }).create()

    await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventA.id,
      dismissedAt: DateTime.local(),
    }).create()

    await NotificationFactory.merge({
      userId: user.id,
      companyId: company.id,
      eventId: eventB.id,
      dismissedAt: DateTime.local(),
    }).create()

    const notifications = await Notification.userNotifications(user.id, company.id, [
      'id',
      'event_id',
      'message',
    ])
    assert.lengthOf(notifications, 0)
  })

  test('notificationCount returns currect undismissed count', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const eventA = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
    }).create()

    const eventB = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-created',
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
      dismissedAt: DateTime.local(),
    }).create()

    const count = await Notification.notificationCount(user.id, company.id)
    assert.equal(count, 1)
  })
})
