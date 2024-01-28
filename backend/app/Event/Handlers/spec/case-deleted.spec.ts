import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import CaseDeleted from 'App/Event/Handlers/CaseDeleted'
import SettingsMaker from 'App/Notification/SettingsMaker'
import { CompanyFactory, UserFactory, CaseFactory, EventFactory } from 'Database/factories'

test.group('Case Deleted Event Handler', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle with company names stores correct message', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')
    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'case-deleted',
    }).create()

    const res = await CaseDeleted.handle(event)
    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${user.firstName} ${user.lastName} has deleted the ${caseInstance.caseName} case.`
    )
  })
})
