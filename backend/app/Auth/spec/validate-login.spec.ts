import cuid from 'cuid'
import test from 'japa'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import ValidateLogin from 'App/Auth/ValidateLogin'
import { UserFactory, CompanyFactory, RoleFactory } from 'Database/factories'
import Role from 'App/Models/Role'

test.group('Validate Login', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('validateUser returns no-such-account', async (assert) => {
    const user = await User.findBy('email', cuid())
    const validate = new ValidateLogin(cuid(), cuid())
    const res = validate.validateUser(user)

    assert.equal(res.success, false)
    assert.equal(res.message?.error, 'no-such-account')
  })

  test('validateUser returns inactive-user', async (assert) => {
    const user = await UserFactory.apply('invited').create()
    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))
    const res = validate.validateUser(user)

    assert.equal(res.success, false)
    assert.equal(res.message?.error, 'inactive-user')
  })

  test('validateUser returns unverified-user', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: false }).create()
    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))
    const res = validate.validateUser(user)

    assert.equal(res.success, false)
    assert.equal(res.message?.error, 'unverified-user')
  })

  test('validateUser returns true', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()
    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))
    const res = validate.validateUser(user)

    assert.equal(res.success, true)
  })

  test('validatePassword returns invalid-password', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()
    const validate = new ValidateLogin(user.email, cuid())

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.validatePassword()

    assert.equal(res.success, false)
    assert.equal(res.message?.error, 'invalid-password')
  })

  test('validatePassword returns true', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()
    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.validatePassword()

    assert.equal(res.success, true)
  })

  test('validateAccountOwner returns false', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.isAccountOwner()

    assert.isFalse(res.success)
  })

  test('validateAccountOwner returns true', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()
    const company = await CompanyFactory.merge({ userId: user.id, deletedAt: null }).create()

    await Role.addRole(user.id, company.id, 'account-owner')

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.isAccountOwner()

    assert.isTrue(res.success)
  })

  test('validateAccountOwner with deleted company returns false', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()
    await CompanyFactory.merge({ userId: user.id }).apply('deleted').create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const { message } = await validate.isAccountOwner()

    assert.equal(message?.error, 'company-is-deleted')
  })

  test('roleCompany returns no-roles', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.roleCompany()

    assert.equal(res.success, false)
    assert.equal(res.message?.error, 'no-roles')
  })

  test('roleCompany multiple returns need-two-factor', async (assert) => {
    const companyA = await CompanyFactory.with('user').create()
    const companyB = await CompanyFactory.with('user').create()

    const user = await UserFactory.merge({ status: 'active', verified: true }).create()

    await RoleFactory.merge({
      companyId: companyA.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    await RoleFactory.merge({
      companyId: companyB.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.roleCompany()

    assert.equal(res.success, true)
    assert.equal(res.message?.action, 'need-two-factor')
  })

  test('roleCompany with account-admin returns need-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = await UserFactory.merge({ status: 'active', verified: true }).create()

    await RoleFactory.merge({
      companyId: company.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.roleCompany()

    assert.equal(res.success, true)
    assert.equal(res.message?.action, 'need-two-factor')
  })

  test('roleCompany with account owner and multi returns need-two-factor', async (assert) => {
    const user = await UserFactory.merge({ status: 'active', verified: true }).create()
    await CompanyFactory.merge({ userId: user.id }).create()
    const companyB = await CompanyFactory.with('user').create()

    await RoleFactory.merge({
      companyId: companyB.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))

    const isValid = validate.validateUser(user)
    assert.isTrue(isValid.success)

    const res = await validate.roleCompany()

    assert.equal(res.success, true)
    assert.equal(res.message?.action, 'need-two-factor')
  })

  test('validate returns need-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = await UserFactory.merge({ status: 'active', verified: true }).create()

    await RoleFactory.merge({
      companyId: company.id,
      userId: user.id,
      role: 'account-admin',
    }).create()

    const validate = new ValidateLogin(user.email, Env.get('TEST_PASSWORD'))
    const res = await validate.validate()

    assert.equal(res.success, true)
    assert.equal(res.message?.action, 'need-two-factor')
  })
})
