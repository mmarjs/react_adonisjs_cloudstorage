import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import Dashboard from 'App/Dashboard/Dashboard'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import {
  CompanyFactory,
  CaseFactory,
  UserFactory,
  WorkGroupFolderFactory,
  WorkGroupFileFactory,
} from 'Database/factories'

test.group('Dashboard Data', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('dashboard index returns correct data for an account-owner', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const owner = company.user

    await Role.addRole(owner.id, company.id, 'account-owner')

    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      caseTypeId: 1,
      timeZoneId: 1,
    }).create()

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseA.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      size: 10,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      size: 20,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    const dashboard = new Dashboard(owner.id, company.id)
    const res = await dashboard.getData()

    assert.equal(res.userCount, 1)
    assert.equal(res.caseCount, 1)
    assert.equal(res.activeLockerCount, 30)
    assert.equal(res.archiveLockerCount, 0)
  })

  test('dashboard index returns correct data for a case manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      caseTypeId: 1,
      timeZoneId: 1,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseA.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseA.id)

    const root = await WorkGroupFolderFactory.merge({
      caseId: caseA.id,
      ownerId: user.id,
      status: 'active',
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      size: 10,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    await WorkGroupFileFactory.merge({
      workGroupFolderId: root.id,
      status: 'active',
      size: 20,
      ownerId: user.id,
      lastAccessedById: user.id,
    }).create()

    const dashboard = new Dashboard(user.id, company.id)
    const res = await dashboard.getData()

    assert.equal(res.caseCount, 1)
    assert.equal(res.activeLockerCount, 30)
    assert.equal(res.archiveLockerCount, 0)
  })
})
