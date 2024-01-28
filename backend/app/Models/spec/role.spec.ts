import test from 'japa'
import Role from 'App/Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, RoleFactory, UserFactory } from 'Database/factories'

test.group('Role Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('hasRole with account-admin returs true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()
    const user = role.user

    const res = await Role.hasRole(user.id, company.id, 'account-admin')
    assert.isTrue(res)
  })

  test('hasRole with invalid account-admin returs false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const res = await Role.hasRole(user.id, company.id, 'account-admin')
    assert.isFalse(res)
  })

  test('hasRole with case-manager returs true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .create()
    const user = role.user

    const res = await Role.hasRole(user.id, company.id, 'case-manager')
    assert.isTrue(res)
  })

  test('hasRole with invalid case-manager returs false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const res = await Role.hasRole(user.id, company.id, 'case-manager')
    assert.isFalse(res)
  })

  test('hasRole with evidence-user returs true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'evidence-user' })
      .with('user')
      .create()
    const user = role.user

    const res = await Role.hasRole(user.id, company.id, 'evidence-user')
    assert.isTrue(res)
  })

  test('hasRole with invalid evidence-user returs false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const res = await Role.hasRole(user.id, company.id, 'evidence-user')
    assert.isFalse(res)
  })

  test('currentRole with an account-admin returs correct role', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()
    const user = role.user

    const currRole = await Role.currentRole(user.id, company.id)
    assert.equal(currRole, 'account-admin')
  })

  test('currentRole with blank user returs evidence-user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const currRole = await Role.currentRole(user.id, company.id)
    assert.equal(currRole, 'client-user')
  })

  test('addRole returs true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const res = await Role.addRole(user.id, company.id, 'case-manager')

    assert.isTrue(res)

    const roles = await Role.query().withScopes((scope) =>
      scope.byCompany(user.id, company.id, 'case-manager')
    )

    assert.lengthOf(roles, 1)
  })

  test('addRole returs false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    await RoleFactory.merge({
      companyId: company.id,
      userId: user.id,
      role: 'case-manager',
    }).create()

    const res = await Role.addRole(user.id, company.id, 'case-manager')

    assert.isFalse(res)
  })

  test('deleteRole with permission false deletes role', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user')
      .create()
    const user = role.user
    const roleId = role.id

    const res = await Role.deleteRole(user.id, company.id)
    assert.isTrue(res)

    const fetchedRole = await Role.find(roleId)

    assert.isNull(fetchedRole)
  })

  test('switchRole removes case-manager with cases and makes an account-admin', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const role = await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .create()
    const user = role.user

    const res = await Role.switchRole(user.id, company.id, 'account-admin')
    assert.isTrue(res)

    const newRole = await Role.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .firstOrFail()

    assert.equal(newRole.role, 'account-admin')
  })

  test('companies returns user companies', async (assert) => {
    const companyA = await CompanyFactory.with('user').create()
    const companyB = await CompanyFactory.with('user').create()

    const user = await UserFactory.create()
    await Role.addRole(user.id, companyA.id, 'account-admin')
    await Role.addRole(user.id, companyB.id, 'account-admin')

    const res = await Role.companies(user.id)

    assert.lengthOf(res, 2)
    assert.isTrue(res.some((c) => c === companyA.id))
    assert.isTrue(res.some((c) => c === companyB.id))
  })

  test('userNames returns all users in roles', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(company.user.id, company.id, 'account-owner')
    await Role.addRole(user.id, company.id, 'account-admin')

    const res = await Role.userNames(company.id)

    assert.lengthOf(res, 2)
    assert.isTrue(res.some((u) => u.id === company.user.id))
    assert.isTrue(res.some((u) => u.id === user.id))
  })

  test('userIds returns correct list', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    await Role.addRole(company.user.id, company.id, 'account-owner')

    await RoleFactory.merge({ companyId: company.id })
      .with('user', 1, (u) => u.apply('invited'))
      .apply('account-admin')
      .create()

    await RoleFactory.merge({ companyId: company.id })
      .with('user', 1, (u) => u.apply('invited'))
      .apply('account-admin')
      .create()

    const res = await Role.userIds(company.id)

    assert.lengthOf(res, 3)
  })
})
