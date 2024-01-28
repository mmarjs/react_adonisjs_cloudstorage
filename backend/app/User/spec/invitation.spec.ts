import test from 'japa'
import Chance from 'chance'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import UserInvitation from 'App/Models/UserInvitation'
import { CompanyFactory, UserFactory, CaseFactory } from 'Database/factories'
import { SpecificUser, UserInvitationBody } from 'App/types'
import Invitation from 'App/User/Invitation'

const chance = Chance.Chance()

test.group('Invitation', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('Invitation adds a role but does not create a new user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const anotherCompany = await CompanyFactory.with('user').create()

    const user = await UserFactory.create()
    await Role.addRole(user.id, anotherCompany.id, 'account-admin')

    const data: UserInvitationBody = {
      company_id: company.id,
      first_name: chance.first(),
      last_name: chance.last(),
      email: user.email,
      role: 'account-admin',
    }

    const countA = await User.query().count('id as total').pojo<{ total: number }>().first()

    const actor: SpecificUser = { userId: company.user.id, companyId: company.id }
    const invitation = new Invitation(data, actor, company)
    const { success } = await invitation.invite()

    const countB = await User.query().count('id as total').pojo<{ total: number }>().first()

    assert.equal(success, 'user-invited')
    assert.equal(countA?.total, countB?.total)

    const roles = await Role.query().where('user_id', user.id).pojo()

    assert.lengthOf(roles, 2)
  })

  test('Invitation creates an account admin', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const data: UserInvitationBody = {
      company_id: company.id,
      first_name: chance.first(),
      last_name: chance.last(),
      email: chance.email(),
      role: 'account-admin',
    }

    const actor: SpecificUser = { userId: company.user.id, companyId: company.id }
    const invitation = new Invitation(data, actor, company)
    const { success } = await invitation.invite()

    assert.equal(success, 'user-invited')

    const user = await User.findByOrFail('email', data.email)
    const userInvitation = await UserInvitation.findByOrFail('user_id', user.id)
    assert.equal(userInvitation.status, 'sent')

    const roles = await Role.query()
      .withScopes((scope) => scope.byCompany(user.id, company.id))
      .pojo()

    assert.lengthOf(roles, 1)

    const permissions = await Permission.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .pojo()
    assert.lengthOf(permissions, 0)
  })

  test('Invitation creates a case-manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const data: UserInvitationBody = {
      company_id: company.id,
      first_name: chance.first(),
      last_name: chance.last(),
      email: chance.email(),
      role: 'case-manager',
      permitted_cases: [caseInstance.id],
    }

    const actor: SpecificUser = { userId: company.user.id, companyId: company.id }
    const invitation = new Invitation(data, actor, company)
    const { success } = await invitation.invite()

    assert.equal(success, 'user-invited')

    const user = await User.findByOrFail('email', data.email)
    const userInvitation = await UserInvitation.findByOrFail('user_id', user.id)
    assert.equal(userInvitation.status, 'sent')

    const role = await Role.query()
      .withScopes((scope) => scope.byCompany(user.id, company.id))
      .first()

    assert.equal(role?.role, 'case-manager')

    const permissions = await Permission.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .where('resource', 'case')

    assert.lengthOf(permissions, 5)

    const actions = permissions.map((p) => p.action)

    assert.isTrue(actions.includes('read'))
    assert.isTrue(actions.includes('write'))
    assert.isTrue(actions.includes('create'))
    assert.isTrue(actions.includes('grant'))
    assert.isTrue(actions.includes('trash'))
  })

  test('Invitation creates a client-user', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()

    const data: UserInvitationBody = {
      company_id: company.id,
      first_name: chance.first(),
      last_name: chance.last(),
      email: chance.email(),
      role: 'client-user',
      permitted_cases: [caseInstance.id],
    }

    const actor: SpecificUser = { userId: company.user.id, companyId: company.id }
    const invitation = new Invitation(data, actor, company)
    const { success } = await invitation.invite()

    assert.equal(success, 'user-invited')

    const user = await User.findByOrFail('email', data.email)
    const userInvitation = await UserInvitation.findByOrFail('user_id', user.id)
    assert.equal(userInvitation.status, 'sent')

    const role = await Role.query()
      .withScopes((scope) => scope.byCompany(user.id, company.id))
      .first()

    assert.equal(role?.role, 'client-user')

    const permissions = await Permission.query()
      .where('user_id', user.id)
      .where('company_id', company.id)
      .where('resource', 'case')

    assert.lengthOf(permissions, 2)

    const actions = permissions.map((p) => p.action)

    assert.isTrue(actions.includes('read'))
    assert.isTrue(actions.includes('write'))
    assert.isFalse(actions.includes('grant'))
    assert.isFalse(actions.includes('trash'))
  })

  test('Invitation rejects a company with max employees reached', async (assert) => {
    const company = await CompanyFactory.merge({ maxEmployees: 1 }).with('user').create()
    const userA = await UserFactory.create()
    await Role.addRole(userA.id, company.id, 'account-admin')

    const data: UserInvitationBody = {
      company_id: company.id,
      first_name: chance.first(),
      last_name: chance.last(),
      email: chance.email(),
      role: 'account-admin',
    }

    const actor: SpecificUser = { userId: company.user.id, companyId: company.id }
    const invitation = new Invitation(data, actor, company)
    const { error } = await invitation.invite()

    assert.equal(error, 'no-avaialable-employees')
  })
})
