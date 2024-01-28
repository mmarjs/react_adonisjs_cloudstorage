import test from 'japa'
import Permission from 'App/Models/Permission'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import UserRemovedFromCase from 'App/Event/Handlers/UserRemovedFromCase'
import {
  CompanyFactory,
  UserFactory,
  RoleFactory,
  EventFactory,
  CaseFactory,
} from 'Database/factories'

test.group('User Removed From Case Event Handler', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle stores correct message', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const actor = company.user

    await RoleFactory.merge({
      userId: actor.id,
      companyId: company.id,
      role: 'account-admin',
    }).create()

    let maker = new SettingsMaker(actor.id, company.id, 'account-admin')
    await maker.make()

    const user = await UserFactory.create()

    await RoleFactory.merge({
      userId: user.id,
      companyId: company.id,
      role: 'case-manager',
    }).create()

    maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const event = await EventFactory.merge({
      userId: actor.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'user-removed-from-case',
      data: { userId: user.id, companyId: company.id },
    }).create()

    const res = await UserRemovedFromCase.handle(event)

    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 2)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${actor.firstName} ${actor.lastName} has removed ${user.fullName} from the ${caseInstance.caseName} case.`
    )
  })
})
