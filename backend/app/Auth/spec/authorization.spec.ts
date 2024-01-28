import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import Authorization from 'App/Auth/Authorization'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import { CompanyFactory, CaseFactory, UserFactory } from 'Database/factories'

test.group('Authorization Spec', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('isAuthorized with account-owner returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user
    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'account-owner')

    const authorization = new Authorization(user.id, company.id, 'read', 'case', caseInstance.id)
    const res = await authorization.isAuthorized()

    assert.isTrue(res)
  })

  test('isAuthorized with account-admin returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const authorization = new Authorization(user.id, company.id, 'read', 'case', caseInstance.id)
    const res = await authorization.isAuthorized()

    assert.isTrue(res)
  })

  test('isAuthorized with case-manager with permission returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const authorization = new Authorization(user.id, company.id, 'read', 'case', caseInstance.id)
    const res = await authorization.isAuthorized()

    assert.isTrue(res)
  })

  test('isAuthorized with case-manager without permission returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const authorization = new Authorization(user.id, company.id, 'read', 'case', caseInstance.id)
    const res = await authorization.isAuthorized()
    assert.isFalse(res)
  })

  test('isAuthorized with client-user with permission returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'client-user')
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const authorization = new Authorization(user.id, company.id, 'read', 'case', caseInstance.id)
    const res = await authorization.isAuthorized()

    assert.isTrue(res)
  })

  test('isAuthorized with client-user without permission returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'client-user')

    const authorization = new Authorization(user.id, company.id, 'read', 'case', caseInstance.id)
    const res = await authorization.isAuthorized()

    assert.isFalse(res)
  })

  test('isAuthorized prevents cross company access', async (assert) => {
    const companyA = await CompanyFactory.with('user').create()
    const companyB = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstanceA = await CaseFactory.merge({
      companyId: companyB.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    const caseInstanceB = await CaseFactory.merge({
      companyId: companyB.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, companyA.id, 'client-user')
    await Permission.addPermission(user.id, companyA.id, 'read', 'case', caseInstanceA.id)
    await Permission.addPermission(user.id, companyB.id, 'read', 'case', caseInstanceB.id)

    let authorization = new Authorization(user.id, companyA.id, 'read', 'case', caseInstanceB.id)
    const resA = await authorization.isAuthorized()

    assert.isFalse(resA)

    authorization = new Authorization(user.id, companyB.id, 'read', 'case', caseInstanceB.id)
    const resB = await authorization.isAuthorized()

    assert.isTrue(resB)
  })

  test('isAuthorized allows account-admin to create new case', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    let authorization = new Authorization(user.id, company.id, 'create', 'case')
    const res = await authorization.isAuthorized()

    assert.isTrue(res)
  })

  test('isAuthorized allows case-manager to create new case', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    let authorization = new Authorization(user.id, company.id, 'create', 'case')
    const res = await authorization.isAuthorized()

    assert.isTrue(res)
  })

  test('isAuthorized rejects client-user to create new case', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      timeZoneId: 1,
      caseTypeId: 2,
    }).create()

    await Role.addRole(user.id, company.id, 'client-user')

    let authorization = new Authorization(user.id, company.id, 'create', 'case')
    const res = await authorization.isAuthorized()

    assert.isFalse(res)
  })
})
