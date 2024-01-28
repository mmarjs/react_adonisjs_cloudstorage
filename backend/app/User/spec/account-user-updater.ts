import test from 'japa'
import Role from 'App/Models/Role'
import Event from 'App/Models/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import Permission from 'App/Models/Permission'
import AccountUserUpdater from 'App/User/AccountUserUpdater'
import { UpdateAccountUser } from 'App/types'
import { CompanyFactory, CaseFactory, UserFactory } from 'Database/factories'

test.group('Account User Updater', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('update with status invited resends email', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const body: UpdateAccountUser = {
      status: 'invited',
    }

    const updater = new AccountUserUpdater(user.id, company.id, company.userId, body)
    const { success } = await updater.update()

    assert.isNotEmpty(success)
    assert.equal(user.id, success?.id)
  })

  test('update replaces permissions for case-manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const case1 = await CaseFactory.merge({
      companyId: company.id,
      createdById: company.user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', case1.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', case1.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', case1.id)

    const case2 = await CaseFactory.merge({
      companyId: company.id,
      createdById: company.user.id,
    }).create()

    const body: UpdateAccountUser = {
      status: 'active',
      permitted_cases: [case2.id],
    }

    const updater = new AccountUserUpdater(user.id, company.id, company.userId, body)
    const { success } = await updater.update()

    assert.isNotEmpty(success)
    assert.equal(user.id, success?.id)

    const permQuery = await Permission.query()
      .select('resource_id')
      .withScopes((scopes) => scopes.byResource(user.id, company.id, 'case'))
      .orderBy('resource_id', 'asc')

    const caseIds = permQuery.map((c) => c.resourceId)

    assert.equal(caseIds.length, 5)
    assert.isTrue(caseIds.includes(case2.id))
    assert.isFalse(caseIds.includes(case1.id))
  })

  test('update on status delete removes role for account-admin', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const body: UpdateAccountUser = {
      status: 'deleted',
      permitted_cases: [],
    }

    const updater = new AccountUserUpdater(user.id, company.id, company.userId, body)
    const { success } = await updater.update()

    assert.isNotEmpty(success)

    const role = await Role.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .first()

    assert.isNull(role)

    const event = await Event.query().where({ resourceId: user.id }).firstOrFail()

    assert.equal(event.name, 'user-removed-from-company')
  })
})
