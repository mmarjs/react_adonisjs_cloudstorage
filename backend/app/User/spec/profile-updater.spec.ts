import test from 'japa'
import ProfileUpdater from 'App/User/ProfileUpdater'
import Role from 'App/Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import { UpdateUserProfile } from 'App/types'
import { CompanyFactory, UserFactory } from 'Database/factories'

test.group('Profile Updater', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('update returns updated user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.merge({ firstName: 'Foo' }).create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const body: UpdateUserProfile = {
      firstName: 'Bar',
    }

    const updater = new ProfileUpdater(user.id, body)
    const { success } = await updater.update()

    assert.equal('Bar', success?.firstName)
  })
})
