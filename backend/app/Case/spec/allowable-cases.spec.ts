import test from 'japa'
import AllowableCases from 'App/Case/AllowableCases'
import Role from 'App/Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import PermissionMaker from 'App/Lib/PermissionMaker'
import { CompanyFactory, UserFactory, CaseFactory } from 'Database/factories'
import { DateTime } from 'luxon'

test.group('Allowable Cases', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('caseIds returns all cases for an account-owner', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-owner')

    const caseA = await CaseFactory.merge({ companyId: company.id }).create()
    const caseB = await CaseFactory.merge({ companyId: company.id }).create()
    const caseC = await CaseFactory.merge({
      companyId: company.id,
      deletedAt: DateTime.local(),
    }).create()

    const allowableCases = new AllowableCases(user.id, company.id, 'read')
    const caseIds = await allowableCases.caseIds()

    const values = new Set(caseIds)

    assert.lengthOf(caseIds, 2)
    assert.isTrue(values.has(caseA.id))
    assert.isTrue(values.has(caseB.id))
    assert.isFalse(values.has(caseC.id))
  })

  test('caseIds returns all cases for an account-admin', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseA = await CaseFactory.merge({ companyId: company.id }).create()
    const caseB = await CaseFactory.merge({ companyId: company.id }).create()
    const caseC = await CaseFactory.merge({
      companyId: company.id,
      deletedAt: DateTime.local(),
    }).create()

    const allowableCases = new AllowableCases(user.id, company.id, 'read')
    const caseIds = await allowableCases.caseIds()

    const values = new Set(caseIds)

    assert.lengthOf(caseIds, 2)
    assert.isTrue(values.has(caseA.id))
    assert.isTrue(values.has(caseB.id))
    assert.isFalse(values.has(caseC.id))
  })

  test('caseIds returns all allowed cases for a case-manager', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const caseA = await CaseFactory.merge({ companyId: company.id }).create()
    const caseB = await CaseFactory.merge({ companyId: company.id }).create()
    const caseC = await CaseFactory.merge({
      companyId: company.id,
      deletedAt: DateTime.local(),
    }).create()

    await PermissionMaker.make(user.id, company.id, caseA.id, 'case', ['read', 'write'])

    const allowableCases = new AllowableCases(user.id, company.id, 'read')
    const caseIds = await allowableCases.caseIds()

    const values = new Set(caseIds)

    assert.lengthOf(caseIds, 1)
    assert.isTrue(values.has(caseA.id))
    assert.isFalse(values.has(caseB.id))
    assert.isFalse(values.has(caseC.id))
  })

  test('caseIds returns all allowed cases for a client-user', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'client-user')

    const caseA = await CaseFactory.merge({ companyId: company.id }).create()
    const caseB = await CaseFactory.merge({ companyId: company.id }).create()
    const caseC = await CaseFactory.merge({
      companyId: company.id,
      deletedAt: DateTime.local(),
    }).create()

    await PermissionMaker.make(user.id, company.id, caseA.id, 'case', ['read', 'write'])

    const allowableCases = new AllowableCases(user.id, company.id, 'read')
    const caseIds = await allowableCases.caseIds()

    const values = new Set(caseIds)

    assert.lengthOf(caseIds, 1)
    assert.isTrue(values.has(caseA.id))
    assert.isFalse(values.has(caseB.id))
    assert.isFalse(values.has(caseC.id))
  })

  test('caseIds returns empty array when trying to delete for a client-user', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const caseA = await CaseFactory.merge({ companyId: company.id }).create()
    await CaseFactory.merge({ companyId: company.id }).create()
    await CaseFactory.merge({
      companyId: company.id,
      deletedAt: DateTime.local(),
    }).create()

    await PermissionMaker.make(user.id, company.id, caseA.id, 'case', ['read', 'write'])

    const allowableCases = new AllowableCases(user.id, company.id, 'trash')
    const caseIds = await allowableCases.caseIds()

    assert.lengthOf(caseIds, 0)
  })

  test('caseIds returns active and archived caseIds', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const caseA = await CaseFactory.merge({ companyId: company.id, status: 'active' }).create()
    const caseB = await CaseFactory.merge({ companyId: company.id, status: 'archived' }).create()
    const caseC = await CaseFactory.merge({ companyId: company.id, status: 'deleted' }).create()

    const allowableCases = new AllowableCases(user.id, company.id, 'trash', ['active', 'archived'])
    const caseIds = await allowableCases.caseIds()

    assert.isTrue(caseIds.some((c) => c === caseA.id))
    assert.isTrue(caseIds.some((c) => c === caseB.id))
    assert.isFalse(caseIds.some((c) => c === caseC.id))
  })
})
