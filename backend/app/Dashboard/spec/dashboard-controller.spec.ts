import test from 'japa'
import supertest from 'supertest'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import { CompanyFactory, CaseFactory, RoleFactory, PermissionFactory } from 'Database/factories'

const BASE_URL = Env.get('APP_URL')

test.group('Dashboard Screen', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('dashboard index returns correct data for account owner', async () => {
    const company = await CompanyFactory.with('user').create()

    const user = company.user
    await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      caseTypeId: 1,
      timeZoneId: 1,
    }).create()

    const token = await makeAuth(user.id, company.id)
    await supertest(BASE_URL).get('/dashboard').set('token', token).expect(200)

    await deleteAuth(token)
  })

  test('dashboard index returns correct data for case manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: company.user.id,
      caseTypeId: 1,
      timeZoneId: 1,
    }).create()

    await CaseFactory.merge({
      companyId: company.id,
      createdById: company.user.id,
      caseTypeId: 1,
      timeZoneId: 1,
    }).create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'case-manager' })
      .with('user')
      .create()

    const user = role.user

    await PermissionFactory.merge({
      companyId: company.id,
      userId: user.id,
      resource: 'case',
      resourceId: caseInstance.id,
    }).create()

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get('/dashboard')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.caseCount, 1)
      })

    await deleteAuth(token)
  })
})
