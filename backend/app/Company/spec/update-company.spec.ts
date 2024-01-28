import test from 'japa'
import Chance from 'chance'
import Database from '@ioc:Adonis/Lucid/Database'
import UpdateCompany from 'App/Company/UpdateCompany'
import { CompanyFactory } from 'Database/factories'
import { UpdateCompanyBody } from 'App/types'

const chance = Chance.Chance()

test.group('Update Company', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('updateCompany updates company name', async (assert) => {
    const company = await CompanyFactory.merge({ name: 'foo' }).with('user').create()

    const data: UpdateCompanyBody = {
      name: chance.name(),
    }
    const update = new UpdateCompany(company.id, data)
    const res = await update.update()

    assert.isNotFalse(res)

    await company.refresh()
    assert.equal(company.name, data.name)
  })
})
