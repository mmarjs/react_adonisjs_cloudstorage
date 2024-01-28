import test from 'japa'
import Chance from 'chance'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, CaseFactory } from 'Database/factories'
import { UpdateCaseParams } from 'App/types'
import UpdateCase from 'App/Case/UpdateCase'

const chance = Chance.Chance()

test.group('Update Case', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('updateCase archives a case', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const params: UpdateCaseParams = {
      caseTypeId: 1,
      timeZoneId: 1,
      caseName: chance.name(),
      clientName: chance.name(),
      status: 'archive',
    }

    const updateCase = new UpdateCase(c.id, params)
    const res = await updateCase.update()
    assert.isTrue(res)

    await c.refresh()

    assert.equal(c.status, 'archived')
  })

  test('updateCase soft deletes a case', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const params: UpdateCaseParams = {
      caseTypeId: 1,
      timeZoneId: 1,
      caseName: chance.name(),
      clientName: chance.name(),
      status: 'delete',
    }

    const updateCase = new UpdateCase(c.id, params)
    const res = await updateCase.update()
    assert.isTrue(res)

    await c.refresh()

    assert.equal(c.status, 'deleted')
    assert.isNotNull(c.deletedAt)
  })
})
