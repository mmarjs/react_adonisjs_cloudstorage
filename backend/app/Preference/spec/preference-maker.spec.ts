import test from 'japa'
import Preference from 'App/Models/Preference'
import Database from '@ioc:Adonis/Lucid/Database'
import PreferenceMaker from 'App/Preference/PreferenceMaker'
import { UserFactory, CompanyFactory } from 'Database/factories'

test.group('Preference Maker', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('make makes preferences', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const maker = new PreferenceMaker(user.id, company.id)
    const res = await maker.make()
    assert.isTrue(res)

    const prefs = await Preference.byUser(user.id, company.id)

    assert.lengthOf(prefs, 3)
  })
})
