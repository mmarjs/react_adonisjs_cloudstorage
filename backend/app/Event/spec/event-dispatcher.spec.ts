import test from 'japa'
import Event from 'App/Models/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import EventDispatcher from 'App/Event/EventDispatcher'
import { CompanyFactory, UserFactory } from 'Database/factories'

test.group('EventDispatcher', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('dispatch returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const res = await EventDispatcher.dispatch({
      userId: user.id,
      companyId: company.id,
      name: 'account-registered',
      data: {
        foo: 1,
      },
    })

    assert.isTrue(res)

    const event = await Event.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .firstOrFail()

    assert.equal(event?.name, 'account-registered')
    assert.equal(event.data?.foo, 1)
  })
})
