import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import UserRemovedFromCompany from 'App/Event/Handlers/UserRemovedFromCompany'
import { CompanyFactory, UserFactory, EventFactory } from 'Database/factories'

test.group('User Removed from Company Event Handler', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle stores correct message', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const actor = company.user
    await Role.addRole(actor.id, company.id, 'account-owner')
    const maker = new SettingsMaker(actor.id, company.id, 'account-admin')
    await maker.make()

    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const event = await EventFactory.merge({
      userId: actor.id,
      companyId: company.id,
      name: 'user-removed-from-company',
      resource: 'user',
      resourceId: user.id,
      data: {
        role: 'account-admin',
        name: user.fullName,
        email: user.email,
      },
    }).create()

    const res = await UserRemovedFromCompany.handle(event)
    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${actor.firstName} ${actor.lastName} has deleted ${user.fullName} (${user.email}), an Account Admin from ${company.name}.`
    )
  })
})
