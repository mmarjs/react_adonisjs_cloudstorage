import test from 'japa'
import Event from 'App/Models/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, UserFactory, EventFactory } from 'Database/factories'

test.group('Event Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('byName returns account-registered event', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'account-registered',
    }).create()

    await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-created',
    }).create()

    await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-deleted',
    }).create()

    const res = await Event.byName(user.id, company.id, 'account-registered')
    assert.isNotNull(res)
    assert.equal(res?.name, 'account-registered')
  })

  test('byUser returns all events', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'account-registered',
    }).create()

    await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-created',
    }).create()

    await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'case-deleted',
    }).create()

    const res = await Event.byUser(user.id, company.id)
    assert.lengthOf(res, 3)
  })

  test('getUser returns associated user', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      name: 'account-registered',
    }).create()

    const res = await Event.getUser(event.id)
    assert.equal(res.first_name, user.firstName)
    assert.equal(res.last_name, user.lastName)
    assert.equal(res.company_name, company.name)
  })
})
