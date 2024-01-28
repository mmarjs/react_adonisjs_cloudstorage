import test from 'japa'
import CaseSearch from 'App/Case/CaseSearch'
import { CaseSearchParams } from 'App/types'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, CaseFactory } from 'Database/factories'
import { DateTime } from 'luxon'

test.group('Case Search', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('search finds by name', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'BatBaz',
      status: 'active',
    }).create()

    const body: CaseSearchParams = {
      type: 'simple',
      search: 'FooBar',
      companyId: company.id,
      showArchived: true,
    }

    const search = new CaseSearch([caseA.id, caseB.id], body)
    const results = await search.search()

    assert.lengthOf(results, 1)
    assert.equal(results[0].id, caseA.id)
    assert.notEqual(results[0].id, caseB.id)
  })

  test('search finds by public_case_id', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'BatBaz',
      status: 'active',
    }).create()

    const body: CaseSearchParams = {
      type: 'simple',
      search: caseA.publicCaseId,
      companyId: company.id,
      showArchived: true,
    }

    const search = new CaseSearch([caseA.id, caseB.id], body)
    const results = await search.search()

    assert.lengthOf(results, 1)
    assert.equal(results[0].id, caseA.id)
    assert.notEqual(results[0].id, caseB.id)
  })

  test('search finds by client_name', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'BatBaz',
      status: 'active',
    }).create()

    const body: CaseSearchParams = {
      type: 'simple',
      search: caseB.clientName,
      companyId: company.id,
      showArchived: true,
    }

    const search = new CaseSearch([caseA.id, caseB.id], body)
    const results = await search.search()

    assert.lengthOf(results, 1)
    assert.equal(results[0].id, caseB.id)
    assert.notEqual(results[0].id, caseA.id)
  })

  test('search finds case name for only active case', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'archived',
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
    }).create()

    const body: CaseSearchParams = {
      type: 'simple',
      search: 'FooBar',
      companyId: company.id,
      showArchived: true,
    }

    const search = new CaseSearch([caseB.id], body)
    const results = await search.search()

    assert.lengthOf(results, 1)
    assert.equal(results[0].id, caseB.id)
    assert.notEqual(results[0].id, caseA.id)
  })

  test('search finds case name for both status', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'archived',
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
    }).create()

    const body: CaseSearchParams = {
      type: 'simple',
      search: 'FooBar',
      companyId: company.id,
      showArchived: true,
    }

    const search = new CaseSearch([caseA.id, caseB.id], body)
    const results = await search.search()

    assert.lengthOf(results, 2)
  })

  test('search finds case name for only caseA', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()

    const caseA = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
    }).create()

    const caseB = await CaseFactory.merge({
      companyId: company.id,
      caseName: 'FooBar',
      status: 'active',
      deletedAt: DateTime.local().minus({ days: 3 }),
    }).create()

    const body: CaseSearchParams = {
      type: 'simple',
      search: 'FooBar',
      companyId: company.id,
      showArchived: true,
    }

    const search = new CaseSearch([caseA.id], body)
    const results = await search.search()

    assert.lengthOf(results, 1)
    assert.equal(results[0].id, caseA.id)
    assert.notEqual(results[0].id, caseB.id)
  })
})
