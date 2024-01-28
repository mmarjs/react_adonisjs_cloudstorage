import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import UserVerified from 'App/Event/Handlers/UserVerified'
import {
  CompanyFactory,
  UserFactory,
  EventFactory,
  NotificationSettingFactory,
} from 'Database/factories'

test.group('UserVerified', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle creates a notification', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const actor = await UserFactory.create()
    await Role.addRole(actor.id, company.id, 'account-admin')
    await NotificationSettingFactory.merge({
      userId: actor.id,
      companyId: company.id,
      event: 'user-verified-account',
    }).create()

    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const event = await EventFactory.merge({
      userId: actor.id,
      companyId: company.id,
      resource: 'user',
      resourceId: user.id,
      name: 'user-verified-account',
    }).create()

    const res = await UserVerified.handle(event)
    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${user.fullName} has accepted their invitation their user account.`
    )
  })
})
