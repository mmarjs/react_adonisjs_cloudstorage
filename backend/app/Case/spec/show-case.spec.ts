import test from 'japa'
import ShowCase from 'App/Case/ShowCase'
import Database from '@ioc:Adonis/Lucid/Database'
import { CaseFactory } from 'Database/factories'

test.group('Show Case', async (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('reqs returns correct data', async (assert) => {
    const showCase = new ShowCase(0)
    const res = await showCase.reqs()

    assert.isNotEmpty(res)
    assert.isArray(res.caseTypes)
    assert.isArray(res.timeZones)
  })

  test('showCase returns correct data', async (assert) => {
    const c = await CaseFactory.with('company', 1, (q) => q.with('user')).create()
    const showCase = new ShowCase(c.id)
    const res = await showCase.show()

    assert.isNotNull(res)

    assert.equal(c.id, res?.caseInstance.id)
    assert.isArray(res?.caseTypes)
    assert.isArray(res?.timeZones)
  })
})
