import test from 'japa'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import ShowUser from 'App/User/ShowUser'
import { CompanyFactory, CaseFactory, UserFactory } from 'Database/factories'

test.group('Show User', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('showUser returns correct data', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const caseA = await CaseFactory.merge({ companyId: company.id }).create()
    const caseB = await CaseFactory.merge({ companyId: company.id }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseA.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseB.id)

    const showUser = new ShowUser(user.id, company.id)

    const { error, success } = await showUser.show()

    assert.isNull(error)
    assert.isArray(success?.cases)
    assert.isArray(success?.states)
    assert.equal(success?.user?.id, user.id)
    assert.lengthOf(success?.cases as object[], 2)
  })
})
