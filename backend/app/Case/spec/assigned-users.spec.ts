import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, CaseFactory, UserFactory } from 'Database/factories'
import AssignedUsers from 'App/Case/AssignedUsers'
import Role from 'App/Models/Role'
import PermissionMaker from 'App/Lib/PermissionMaker'

test.group('Assigned Users', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getData returns correct users', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await Role.addRole(company.userId, company.id, 'account-owner')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: company.user.id,
    }).create()

    const userA = await UserFactory.create()
    await Role.addRole(userA.id, company.id, 'account-admin')

    const userB = await UserFactory.create()
    await Role.addRole(userB.id, company.id, 'case-manager')

    await PermissionMaker.make(userB.id, company.id, caseInstance.id, 'case', [
      'read',
      'write',
      'grant',
      'trash',
      'create',
    ])

    const userC = await UserFactory.create()
    await Role.addRole(userC.id, company.id, 'client-user')

    await PermissionMaker.make(userC.id, company.id, caseInstance.id, 'case', ['read', 'write'])

    const assignedUsers = new AssignedUsers(company.userId, company.id, caseInstance.id)
    const data = await assignedUsers.getData()

    const userIds = data.users.map((d) => d.user_id)

    assert.lengthOf(data?.users, 3)
    assert.isTrue(userIds.includes(userA.id))
    assert.isTrue(userIds.includes(userB.id))
    assert.isTrue(userIds.includes(userC.id))
  })

  test('getData does not return current account admin', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await Role.addRole(company.userId, company.id, 'account-owner')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: company.user.id,
    }).create()

    const userA = await UserFactory.create()
    await Role.addRole(userA.id, company.id, 'account-admin')

    const userB = await UserFactory.create()
    await Role.addRole(userB.id, company.id, 'account-admin')

    const assignedUsers = new AssignedUsers(userA.id, company.id, caseInstance.id)
    const data = await assignedUsers.getData()

    const userIds = data.users.map((d) => d.user_id)

    assert.lengthOf(data?.users, 1)
    assert.isTrue(userIds.includes(userB.id))
  })

  test('getData does not return current case-manager', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await Role.addRole(company.userId, company.id, 'account-owner')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: company.user.id,
    }).create()

    const userA = await UserFactory.create()
    await Role.addRole(userA.id, company.id, 'case-manager')

    await PermissionMaker.make(userA.id, company.id, caseInstance.id, 'case', [
      'read',
      'write',
      'create',
      'grant',
      'trash',
    ])

    const userB = await UserFactory.create()
    await Role.addRole(userB.id, company.id, 'case-manager')

    await PermissionMaker.make(userB.id, company.id, caseInstance.id, 'case', [
      'read',
      'write',
      'create',
      'grant',
      'trash',
    ])

    const assignedUsers = new AssignedUsers(userA.id, company.id, caseInstance.id)
    const data = await assignedUsers.getData()

    assert.lengthOf(data?.users, 1)
    assert.equal(data.users[0].user_id, userB.id)
  })

  test('getData returns available Users', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await Role.addRole(company.userId, company.id, 'account-owner')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: company.user.id,
    }).create()

    const userA = await UserFactory.create()
    await Role.addRole(userA.id, company.id, 'case-manager')

    const userB = await UserFactory.create()
    await Role.addRole(userB.id, company.id, 'case-manager')

    await PermissionMaker.make(userB.id, company.id, caseInstance.id, 'case', [
      'read',
      'write',
      'create',
      'grant',
      'trash',
    ])

    const userC = await UserFactory.create()
    await Role.addRole(userC.id, company.id, 'account-admin')

    const assignedUsers = new AssignedUsers(userA.id, company.id, caseInstance.id)
    const data = await assignedUsers.getData()

    const userIds = data.users.map((d) => d.user_id)
    const availableIds = data.available.map((d) => d.user_id)

    assert.lengthOf(data?.users, 2)
    assert.isTrue(userIds.includes(userB.id))
    assert.isTrue(userIds.includes(userC.id))
    assert.isTrue(availableIds.includes(userA.id))
  })

  test('getData returns available Users only for Company A', async (assert) => {
    const companyA = await CompanyFactory.with('user', 1).create()
    const companyB = await CompanyFactory.with('user', 1).create()

    await Role.addRole(companyA.userId, companyA.id, 'account-owner')
    await Role.addRole(companyB.userId, companyB.id, 'account-owner')

    const caseA = await CaseFactory.merge({
      companyId: companyA.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: companyA.user.id,
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: companyB.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: companyB.user.id,
    }).create()

    const userA = await UserFactory.create()
    await Role.addRole(userA.id, companyA.id, 'case-manager')

    await PermissionMaker.make(userA.id, companyA.id, caseA.id, 'case', [
      'read',
      'write',
      'create',
      'grant',
      'trash',
    ])

    const userB = await UserFactory.create()
    await Role.addRole(userB.id, companyA.id, 'case-manager')

    const userC = await UserFactory.create()
    await Role.addRole(userC.id, companyB.id, 'case-manager')

    await PermissionMaker.make(userC.id, companyB.id, caseB.id, 'case', [
      'read',
      'write',
      'create',
      'grant',
      'trash',
    ])

    const assignedUsers = new AssignedUsers(companyA.user.id, companyA.id, caseA.id)
    const data = await assignedUsers.getData()

    const userIds = data.users.map((d) => d.user_id)
    const availableIds = data.available.map((d) => d.user_id)

    assert.lengthOf(data?.users, 1)
    assert.lengthOf(data.available, 1)
    assert.isTrue(userIds.includes(userA.id))
    assert.isFalse(userIds.includes(userB.id))

    assert.isTrue(availableIds.includes(userB.id))
    assert.isFalse(availableIds.includes(userA.id))
    assert.isFalse(availableIds.includes(userC.id))
  })
})
