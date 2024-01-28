import test from 'japa'
import Permission from 'App/Models/Permission'
import Database from '@ioc:Adonis/Lucid/Database'
import PermissionMaker from 'App/Lib/PermissionMaker'
import { UserFactory, CompanyFactory, CaseFactory } from 'Database/factories'

test.group('Permission Maker', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('make creates permissions', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    await PermissionMaker.make(user.id, company.id, caseInstance.id, 'case', [
      'read',
      'create',
      'write',
    ])

    const permissions = await Permission.query().withScopes((s) =>
      s.byResource(user.id, company.id, 'case')
    )

    assert.lengthOf(permissions, 3)

    const actions = permissions.map((p) => p.action)

    assert.isTrue(actions.includes('read'))
    assert.isTrue(actions.includes('write'))
    assert.isTrue(actions.includes('create'))
  })
})
