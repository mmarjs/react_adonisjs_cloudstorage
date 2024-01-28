import test from 'japa'
import supertest from 'supertest'
import Case from 'App/Models/Case'
import WorkGroupFolder from 'App/Models/WorkGroupFolder'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import { CompanyFactory, CaseFactory, UserFactory } from 'Database/factories'
import Permission from 'App/Models/Permission'
import Role from 'App/Models/Role'
import Chance from 'chance'
import { CaseSearchParams, CreateCaseParams, UpdateCaseParams } from 'App/types'

const BASE_URL = Env.get('APP_URL')
const chance = Chance.Chance()

test.group('Case Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('GET /cases returns ok for an account owner', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'account-owner')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.cases, 1)
      })
    await deleteAuth(token)
  })

  test('GET /cases returns ok for an account admin', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.cases, 1)
      })

    await deleteAuth(token)
  })

  test('GET /cases returns ok for an case manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.cases, 1)
      })

    await deleteAuth(token)
  })

  test('GET /cases returns ok for an client user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'client-user')
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.cases, 1)
      })

    await deleteAuth(token)
  })

  test('GET /cases/:id/show returns 200 for account owner', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases/${caseInstance.id}/show`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.caseInstance.id, caseInstance.id)
      })

    await deleteAuth(token)
  })

  test('GET /cases/:id/show returns 200 for case user with perms', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      timeZoneId: 1,
      caseTypeId: 1,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases/${caseInstance.id}/show`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.caseInstance.id, caseInstance.id)
      })

    await deleteAuth(token)
  })

  test('GET /cases/:id/show returns 403 for case user no perms', async () => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases/${caseInstance.id}/show`)
      .set({ token: token })
      .expect(403)

    await deleteAuth(token)
  })

  test('GET /cases/:id/assigned_users 200', async (assert) => {
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

    await Permission.addPermission(userB.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(userB.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(userB.id, company.id, 'create', 'case', caseInstance.id)

    const userC = await UserFactory.create()
    await Role.addRole(userC.id, company.id, 'client-user')

    await Permission.addPermission(userC.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(userC.id, company.id, 'write', 'case', caseInstance.id)

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .get(`/cases/${caseInstance.id}/assigned_users`)
      .set({ token: token })
      .expect(200)
      .then((res) => {
        const data = res.body

        const userIds = data.users.map((d) => d.user_id)

        assert.lengthOf(userIds, 3)
        assert.isTrue(userIds.includes(userA.id))
        assert.isTrue(userIds.includes(userB.id))
        assert.isTrue(userIds.includes(userC.id))
      })

    await deleteAuth(token)
  })

  test('GET /cases/reqs returns 200', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .get('/cases/reqs')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.isTrue(res.body.caseTypes.length > 0)
        assert.isTrue(res.body.timeZones.length > 0)
      })

    await deleteAuth(token)
  })

  test('POST /cases/store returns 200 with minimum valid data', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const params: CreateCaseParams = {
      companyId: company.id,
      caseTypeId: 1,
      timeZoneId: 1,
      caseName: chance.name(),
      clientName: chance.name(),
      createdById: user.id,
      status: 'active',
    }

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL).post('/cases/store').set('token', token).send(params).expect(200)

    const caseInstance = await Case.query().where('created_by_id', params.createdById).firstOrFail()

    const folders = await WorkGroupFolder.query().where('case_id', caseInstance.id)

    folders.forEach((folder) => {
      assert.equal(folder.parentId, 0)
      assert.equal(folder.caseId, caseInstance.id)
    })

    await deleteAuth(token)
  })

  test('POST /cases/store returns 200 with all data', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const params: CreateCaseParams = {
      companyId: company.id,
      caseTypeId: 1,
      timeZoneId: 1,
      caseName: chance.name(),
      clientName: chance.name(),
      createdById: user.id,
      clientReference: chance.string(),
      clientPhone: chance.string(),
      clientEmail: chance.string(),
      notes: chance.string(),
      status: 'active',
    }

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL).post('/cases/store').set('token', token).send(params).expect(200)

    const caseInstance = await Case.query().where('created_by_id', params.createdById).firstOrFail()

    const folders = await WorkGroupFolder.query().where('case_id', caseInstance.id)

    folders.forEach((folder) => {
      assert.equal(folder.parentId, 0)
      assert.equal(folder.caseId, caseInstance.id)
    })

    await deleteAuth(token)
  })

  test('POST /cases/:id/add_user returns 200', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    const target = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Role.addRole(target.id, company.id, 'case-manager')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'grant', 'case', caseInstance.id)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .post(`/cases/${caseInstance.id}/add_user`)
      .set({ token: token })
      .send({
        userId: target.id,
        companyId: company.id,
        resourceId: caseInstance.id,
      })
      .expect(200)

    const permission = await Permission.query()
      .where('company_id', company.id)
      .where('user_id', target.id)
      .firstOrFail()

    assert.equal(permission.userId, target.id)
    assert.equal(permission.resourceId, caseInstance.id)
    await deleteAuth(token)
  })

  test('POST /cases/search finds by name', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

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

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseA.id)
    await Permission.addPermission(user.id, company.id, 'read', 'case', caseB.id)

    const params: CaseSearchParams = {
      type: 'simple',
      search: 'FooBar',
      companyId: company.id,
      showArchived: true,
    }

    const token = await makeAuth(user.id, company.id)
    await supertest(BASE_URL)
      .post('/cases/search')
      .set('token', token)
      .send(params)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body, 1)
        assert.equal(res.body[0].id, caseA.id)
        assert.notEqual(res.body[0].id, caseB.id)
      })

    await deleteAuth(token)
  })

  test('PUT /cases/:id/update changes active to archived', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
      status: 'active',
    }).create()

    const params: UpdateCaseParams = {
      caseTypeId: 3,
      timeZoneId: 2,
      caseName: 'Foo Fighters v U2',
      clientName: 'Awesome Name',
      status: 'archive',
    }

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/cases/${caseInstance.id}/update`)
      .set('token', token)
      .send(params)
      .expect(200)

    const latestInstance = await Case.findOrFail(caseInstance.id)

    assert.equal(latestInstance.status, 'archived')
    assert.equal(latestInstance.deletedAt, null)

    await deleteAuth(token)
  })

  test('PUT /cases/:id/update changes active to deleted', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    const params: UpdateCaseParams = {
      caseTypeId: 3,
      timeZoneId: 2,
      caseName: 'Foo Fighters v U2',
      clientName: 'Awesome Name',
      status: 'delete',
    }

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/cases/${caseInstance.id}/update`)
      .set('token', token)
      .send(params)
      .expect(200)

    const latestInstance = await Case.findOrFail(caseInstance.id)

    assert.equal(latestInstance.status, 'deleted')
    assert.notEqual(latestInstance.deletedAt, null)

    await deleteAuth(token)
  })

  test('PUT /cases/:id/update returns 200 and validates case-manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const token = await makeAuth(user.id, company.id)

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    const params: UpdateCaseParams = {
      caseTypeId: 3,
      timeZoneId: 2,
      caseName: 'Foo Fighters v U2',
      clientName: 'Awesome Name',
      status: 'archive',
    }

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)

    await supertest(BASE_URL)
      .put(`/cases/${caseInstance.id}/update`)
      .set('token', token)
      .send(params)
      .expect(200)

    const latestInstance = await Case.findOrFail(caseInstance.id)

    assert.equal(latestInstance.status, 'archived')
    assert.isNull(latestInstance.deletedAt)

    await deleteAuth(token)
  })

  test('PUT /cases/:id/update rejects case-manager without perms', async () => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'case-manager')

    const token = await makeAuth(user.id, company.id)

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    const params: UpdateCaseParams = {
      caseTypeId: 3,
      timeZoneId: 2,
      caseName: 'Foo Fighters v U2',
      clientName: 'Awesome Name',
      status: 'delete',
    }

    await supertest(BASE_URL)
      .put(`/cases/${caseInstance.id}/update`)
      .set('token', token)
      .send(params)
      .expect(403)

    await deleteAuth(token)
  })

  test('DELETE /cases/:id/remove_user return 200', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()
    const target = await UserFactory.create()

    const caseInstance = await CaseFactory.merge({
      companyId: company.id,
      createdById: user.id,
    }).create()

    await Role.addRole(user.id, company.id, 'case-manager')
    await Role.addRole(target.id, company.id, 'case-manager')

    await Permission.addPermission(user.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(user.id, company.id, 'grant', 'case', caseInstance.id)

    await Permission.addPermission(target.id, company.id, 'read', 'case', caseInstance.id)
    await Permission.addPermission(target.id, company.id, 'write', 'case', caseInstance.id)
    await Permission.addPermission(target.id, company.id, 'grant', 'case', caseInstance.id)

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .delete(`/cases/${caseInstance.id}/remove_user`)
      .set({ token: token })
      .send({
        userId: target.id,
        companyId: company.id,
        resourceId: caseInstance.id,
      })
      .expect(200)

    const result = await Permission.query().withScopes((scope) =>
      scope.byResourceId(target.id, company.id, 'case', caseInstance.id)
    )
    assert.lengthOf(result, 0)
    await deleteAuth(token)
  })
})
