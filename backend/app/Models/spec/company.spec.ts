import test from 'japa'
import Role from 'App/Models/Role'
import Company from 'App/Models/Company'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory, CompanyFactory } from 'Database/factories'

test.group('Company Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  test('isAccountOwner returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const res = await Company.isAccountOwner(company.user.id, company.id)
    assert.isTrue(res)
  })

  test('isAccountOwner returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const res = await Company.isAccountOwner(user.id, company.id)
    assert.isFalse(res)
  })

  test('ownsAnyAccounts returs true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const res = await Company.ownsAnyAccounts(company.user.id)
    assert.isTrue(res)
  })

  test('ownsAnyAccounts returs false', async (assert) => {
    const user = await UserFactory.create()
    const res = await Company.ownsAnyAccounts(user.id)
    assert.isFalse(res)
  })

  test('isDeleted returns true', async (assert) => {
    const company = await CompanyFactory.apply('deleted').with('user').create()

    const res = await Company.isDeleted(company.id)
    assert.isTrue(res)
  })

  test('employeeInfo with valid company and 0 out of 3', async (assert) => {
    const company = await CompanyFactory.merge({ maxEmployees: 3 }).with('user').create()

    const { current, max } = await Company.employeeInfo(company.id)

    assert.equal(current, 0)
    assert.equal(max, 3)
  })

  test('employeeInfo returns 2 out of 3', async (assert) => {
    const company = await CompanyFactory.merge({ maxEmployees: 3 }).with('user').create()
    const userA = await UserFactory.create()
    const userB = await UserFactory.create()

    await Role.addRole(userA.id, company.id, 'account-admin')
    await Role.addRole(userB.id, company.id, 'account-admin')

    const { current, max } = await Company.employeeInfo(company.id)

    assert.equal(current, 2)
    assert.equal(max, 3)
  })

  test('employeeInfo returns only active users', async (assert) => {
    const company = await CompanyFactory.merge({ maxEmployees: 3 }).with('user').create()
    const userA = await UserFactory.apply('invited').create()
    const userB = await UserFactory.apply('suspended').create()
    const userC = await UserFactory.create()

    await Role.addRole(userA.id, company.id, 'account-admin')
    await Role.addRole(userB.id, company.id, 'account-admin')
    await Role.addRole(userC.id, company.id, 'account-admin')

    const { current, max } = await Company.employeeInfo(company.id)

    assert.equal(current, 1)
    assert.equal(max, 3)
  })
})
