import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import ShowUsers from 'App/User/ShowUsers'
import { CompanyFactory, UserFactory } from 'Database/factories'

test.group('Show Users', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('showUsers returns all users in Company', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const userA = await UserFactory.apply('invited').create()
    const userB = await UserFactory.create()
    const userC = await UserFactory.create()
    const userD = await UserFactory.apply('deleted').create()
    await Role.addRole(userA.id, company.id, 'account-admin')
    await Role.addRole(userB.id, company.id, 'case-manager')
    await Role.addRole(userC.id, company.id, 'client-user')
    await Role.addRole(userD.id, company.id, 'client-user')

    const users = new ShowUsers(company.id)
    const res = await users.show()
    assert.lengthOf(res.users, 3)

    const userIds = res.users.map((r) => r.id)
    assert.isTrue(userIds.includes(userA.id))
    assert.isTrue(userIds.includes(userB.id))
    assert.isTrue(userIds.includes(userC.id))
    assert.isFalse(userIds.includes(userD.id))
  })
})
