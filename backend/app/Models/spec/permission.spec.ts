import test from 'japa'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, CaseFactory, RoleFactory, UserFactory } from 'Database/factories'

test.group('Permission Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
  test('addPermission returns permission id', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const role = await RoleFactory.merge({
      companyId: company.id,
      role: 'case-manager',
    })
      .with('user')
      .create()

    const user = role.user

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const permissions = await Permission.query()
      .select('action')
      .withScopes((scope) => scope.byResourceId(user.id, company.id, 'case', caseInstance.id))

    const perms = permissions.map((p) => p.action)

    assert.isTrue(perms.some((p) => p === 'read'))
  })

  test('remove permission by resource returns true', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const case1 = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    const case2 = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', case1.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', case1.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', case2.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', case2.id)

    const res = await Permission.removePermission(user.id, company.id, 'case')
    assert.isTrue(res)

    const permissions = await Permission.query()
      .select('action')
      .withScopes((scope) => scope.byResource(user.id, company.id, 'case'))

    assert.lengthOf(permissions, 0)
  })

  test('Permission.addPermission by resourceId returns true', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const case1 = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    const case2 = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', case1.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', case1.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', case2.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', case2.id)

    await Permission.removePermission(user.id, company.id, 'case', case1.id)

    const permissions = await Permission.query()
      .select('resource_id')
      .withScopes((scope) => scope.byResource(user.id, company.id, 'case'))

    const ids = permissions.map((p) => p.resourceId)

    assert.lengthOf(permissions, 2)
    assert.isTrue(ids.some((id) => id === case2.id))
    assert.isFalse(ids.some((id) => id === case1.id))
  })

  test('Permission.removePermissions returns true', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseA.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseA.id)
    await Permission.addPermission(user.id, company.id, 'grant', 'case', caseA.id)
    await Permission.addPermission(user.id, company.id, 'trash', 'case', caseA.id)

    const res = await Permission.removePermissions(user.id, company.id, 'case')

    assert.isTrue(res)

    const count = await Permission.query()
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .where({ resource: 'case' })
      .count('id as total')
      .pojo<{ total: number }>()
      .first()

    assert.equal(count?.total, 0)
  })

  test('get assigned users number', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const res = await Permission.assignedUserCount(company.id)
    const { caseId, userNumber } = res[0]

    assert.equal(userNumber, 1)
    assert.equal(caseId, caseInstance.id)
  })

  test('hasAny returns true', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)

    const res = await Permission.hasAny(user.id, company.id, 'case')
    assert.isTrue(res)
  })

  test('hasAny returns false', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const res = await Permission.hasAny(user.id, company.id, 'case')
    assert.isFalse(res)
  })
})
