import test from 'japa'
import Chance from 'chance'
import Case from 'App/Models/Case'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory } from 'Database/factories'
import { CreateCaseParams } from 'App/types'
import StoreCase from 'App/Case/StoreCase'

const chance = Chance.Chance()

test.group('Store Case', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('storeCase returns correct number', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const nextCaseId = await Case.nextPublicId(company.id)
    const params: CreateCaseParams = {
      companyId: company.id,
      caseTypeId: 1,
      timeZoneId: 1,
      caseName: chance.name(),
      clientName: chance.name(),
      createdById: user.id,
      status: 'active',
    }

    const store = new StoreCase(user.id, company.id, params)
    const { success } = await store.store()

    assert.isTrue(success)

    const c = await Case.findByOrFail('company_id', company.id)
    const folder = await WorkGroupFolder.query().where('case_id', c.id).first()

    assert.isNotNull(folder)
    assert.equal(nextCaseId, c.publicCaseId)
  })
})
