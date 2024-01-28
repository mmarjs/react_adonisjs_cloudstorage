import test from 'japa'
import supertest from 'supertest'
import cuid from 'cuid'
import User from 'App/Models/User'
import chanceInstance from 'chance'
import { makeAuth, deleteAuth } from 'App/Lib/Helpers'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import PersonalFolder from 'App/Models/PersonalFolder'
import Role from 'App/Models/Role'
import Event from 'App/Models/Event'
import { CompanyFactory, UserFactory, CaseFactory, UserInvitationFactory } from 'Database/factories'

const BASE_URL = Env.get('APP_URL')
const chance = chanceInstance.Chance()

test.group('User Controller', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('GET /users/reqs returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    await CaseFactory.merge({ companyId: company.id }).create()

    const token = await makeAuth(user.id, company.id)
    await supertest(BASE_URL)
      .get(`/users/reqs`)
      .set('token', token)
      .expect(200)
      .then((res) => {
        const cases = res.body.cases
        const states = res.body.states as any[]

        assert.lengthOf(cases, 1)
        assert.isAtLeast(states.length, 1)
      })
    await deleteAuth(token)
  })

  test('GET /users returns users', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    await Role.addRole(company.user.id, company.id, 'account-owner')

    const userA = await UserFactory.apply('invited').create()
    const userB = await UserFactory.create()
    const userC = await UserFactory.create()
    const userD = await UserFactory.apply('deleted').create()
    await Role.addRole(userA.id, company.id, 'account-admin')
    await Role.addRole(userB.id, company.id, 'case-manager')
    await Role.addRole(userC.id, company.id, 'client-user')
    await Role.addRole(userD.id, company.id, 'client-user')

    const token = await makeAuth(company.user.id, company.id)

    await supertest(BASE_URL)
      .get('/users')
      .set('token', token)
      .expect(200)
      .then((res) => {
        assert.lengthOf(res.body.users, 3)

        const userIds = res.body.users.map((r) => r.id)
        assert.isTrue(userIds.includes(userA.id))
        assert.isTrue(userIds.includes(userB.id))
        assert.isTrue(userIds.includes(userC.id))
        assert.isFalse(userIds.includes(userD.id))
        assert.equal(res.body.employeeInfo.current, 1)
        assert.equal(res.body.employeeInfo.max, 3)
      })

    await deleteAuth(token)
  })

  test('POST /register creates a new user with valid data', async (assert) => {
    const body = {
      email: chance.email(),
      first_name: 'Joe',
      last_name: 'Soap',
      password: cuid(),
      account_name: chance.company(),
    }

    await supertest(BASE_URL).post('/register').send(body).expect(200)

    const user = await User.findByOrFail('email', body.email)
    assert.equal(body.email, user.email)

    const folder = await PersonalFolder.query().where('user_id', user.id).firstOrFail()
    assert.equal(folder.userId, user.id)
    assert.equal(folder.parentId, 0)
  })

  test('POST /verify_account verifies an account', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (u) =>
      u.merge({ verified: false, status: 'invited' })
    ).create()
    const user = company.user

    await Role.addRole(user.id, company.id, 'account-owner')

    await supertest(BASE_URL)
      .post('/verify_account')
      .send({
        token: user.verificationToken,
      })
      .expect(200)

    await user.refresh()

    assert.isNull(user.verificationToken)
    assert.equal(user.verified, true)
    assert.equal(user.status, 'active')
  })

  test('POST /verify_user returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.apply('invited').create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const invitation = await UserInvitationFactory.merge({
      userId: user.id,
      companyId: company.id,
      status: 'sent',
    }).create()

    assert.equal(invitation.status, 'sent')
    assert.equal(user.status, 'invited')

    await supertest(BASE_URL)
      .post('/verify_user')
      .send({
        code: invitation.code,
        password: cuid(),
      })
      .expect(200)
      .then(async (res) => {
        assert.isTrue(res.body.success)
      })

    await user.refresh()
    assert.equal(user.status, 'active')

    await invitation.refresh()
    assert.equal(invitation.status, 'accepted')

    const folder = await PersonalFolder.query().where('user_id', user.id).firstOrFail()
    assert.equal(folder.userId, user.id)
  })

  test('POST /users/invite returns ok', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user
    await Role.addRole(user.id, company.id, 'account-owner')

    const token = await makeAuth(user.id, company.id)
    const email = chance.email()

    await supertest(BASE_URL)
      .post('/users/invite')
      .set('token', token)
      .send({
        company_id: company.id,
        first_name: chance.first(),
        last_name: chance.last(),
        company_name: chance.company(),
        street: chance.street(),
        state: chance.state(),
        zip: chance.zip(),
        phone: chance.phone(),
        email: email,
        role: 'account-admin',
        permitted_cases: [],
      })
      .expect(200)
      .then((res) => {
        assert.equal(res.body.status, 'user-invited')
      })

    await deleteAuth(token)
  })

  test('PUT /users/:id/update_account updates user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/users/${user.id}/update_account`)
      .set('token', token)
      .send({
        status: 'active',
        first_name: 'test_first_name',
        last_name: 'test_last_name',
        street: '123 Farthing Street',
        city: 'Foo City',
        state: 'Foo',
        zip: 12345,
        phone: '(323)-324-2542',
        role: 'case-manager',
        permitted_cases: [],
        permitted_custodians: [],
      })
      .expect(200)

    const role = await Role.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .firstOrFail()

    assert.equal(role.role, 'case-manager')

    await deleteAuth(token)
  })

  test('PUT /users/:id/update_account deletes user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const token = await makeAuth(user.id, company.id)

    await supertest(BASE_URL)
      .put(`/users/${user.id}/update_account`)
      .set('token', token)
      .send({
        status: 'deleted',
        first_name: 'test_first_name',
        last_name: 'test_last_name',
        street: '123 Farthing Street',
        city: 'Foo City',
        state: 'Foo',
        zip: 12345,
        phone: '(323)-324-2542',
        role: 'case-manager',
        permitted_cases: [],
        permitted_custodians: [],
      })
      .expect(200)

    const event = await Event.query()
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .firstOrFail()

    assert.equal(event.name, 'user-removed-from-company')

    await deleteAuth(token)
  })
})
