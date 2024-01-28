import test from 'japa'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import UserAddedToCompany from 'App/Event/Handlers/UserAddedToCompany'
import { CompanyFactory, UserFactory, RoleFactory, EventFactory } from 'Database/factories'

test.group('User Added To Company Event Handler', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle stores correct message', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const actor = company.user
    const user = await UserFactory.create()
    const role = await RoleFactory.merge({
      userId: user.id,
      companyId: company.id,
      role: 'account-admin',
    }).create()
    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const event = await EventFactory.merge({
      userId: actor.id,
      companyId: company.id,
      resourceId: role.id,
      name: 'user-added-to-company',
    }).create()

    const res = await UserAddedToCompany.handle(event)
    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${actor.firstName} ${actor.lastName} has added ${user.fullName} (${user.email}) as an Account Admin to ${company.name}.`
    )
  })
})
