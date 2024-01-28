import cuid from 'cuid'
import test from 'japa'
import Chance from 'chance'
import Env from '@ioc:Adonis/Core/Env'
import { LoginInput } from 'App/types'
import TwoFactorToken from 'App/Models/TwoFactorToken'
import Database from '@ioc:Adonis/Lucid/Database'
import Role from 'App/Models/Role'
import handleLogin from 'App/Auth/HandleLogin'
import { randomBytes } from 'crypto'
import { totp } from '@otplib/preset-default'
import { DateTime } from 'luxon'
import Auth from 'App/Auth/Auth'
import { CompanyFactory, RoleFactory, UserFactory, TwoFactorTokenFactory } from 'Database/factories'

const chance = Chance.Chance()

test.group('HandleLogin', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handleLogin no-such-account', async (assert) => {
    const params: LoginInput = {
      action: 'validate-login',
      email: chance.email(),
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'no-such-account')
  })

  test('handleLogin returns inactive-user', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('invited').apply('unverified')
    }).create()
    const user = company.user

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'inactive-user')
  })

  test('handleLogin returns unverified-user', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('invited').apply('unverified')
    }).create()
    const user = await UserFactory.apply('unverified').create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'unverified-user')
  })

  test('handleLogin returns invalid-password', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = company.user

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: chance.guid(),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'invalid-password')
  })

  test('handleLogin returns no-roles', async (assert) => {
    const user = await UserFactory.create()

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'no-roles')
  })

  test('handleLogin validate-login returns need-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (u) =>
      u.merge({ status: 'active', verified: true })
    ).create()
    const user = company.user

    await Role.addRole(user.id, company.id, 'account-owner')

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success?.action, 'need-two-factor')
  })

  test('handleLogin returns need-two-factor for user with two roles', async (assert) => {
    const companyA = await CompanyFactory.with('user').create()
    const companyB = await CompanyFactory.with('user').create()

    const user = await UserFactory.create()

    await Role.addRole(user.id, companyA.id, 'account-admin')
    await Role.addRole(user.id, companyB.id, 'account-admin')

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success?.action, 'need-two-factor')
  })

  test('handleLogin accepts non account owner with one roles', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const params: LoginInput = {
      action: 'validate-login',
      email: user.email,
      password: Env.get('TEST_PASSWORD'),
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success?.action, 'need-two-factor')
  })

  test('handleLogin returns invalid-login-process-token', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const params: LoginInput = {
      action: 'need-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: cuid(),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'invalid-login-process-token')
  })

  test('handleLogin returns company-is-deleted', async (assert) => {
    const company = await CompanyFactory.apply('deleted').with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'need-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken,
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'company-is-deleted')
  })

  test('handleLogin returns company required 2fa token', async (assert) => {
    const company = await CompanyFactory.apply('2fa_required').with('user', 1).create()
    const user = company.user

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'need-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.isTrue(success?.status)

    const twoFactorToken = await TwoFactorToken.first()
    assert.equal(twoFactorToken?.userId, user.id)
  })

  test('handleLogin returns user required 2fa token', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'account-admin' })
      .with('user', 1, (user) => user.apply('2fa_required'))
      .create()

    const user = role.user

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'need-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.isTrue(success?.status)

    const twoFactorToken = await TwoFactorToken.first()
    assert.equal(twoFactorToken?.userId, user.id)
  })

  test('handleLogin returns two-factor-verified', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('2fa_required')
    }).create()

    const user = company.user

    totp.options = { step: 30 }

    const secret = randomBytes(20).toString('hex')
    const token = totp.generate(secret)

    const twoFactorToken = await TwoFactorTokenFactory.merge({
      userId: user.id,
      secret: secret,
      token: token,
    }).create()

    const isValid = totp.check(twoFactorToken.token, twoFactorToken.secret)
    assert.isTrue(isValid)

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'verify-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
      twoFactorToken: twoFactorToken.token,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success.status, 'two-factor-verified')
  })

  test('handleLogin with a 4 minute old 2FA token returns two-factor-verified', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('2fa_required')
    }).create()
    const user = company.user
    const epoch = DateTime.local().minus({ seconds: 240 }).toMillis()

    totp.options = { step: 30, epoch: epoch }
    const secret = randomBytes(20).toString('hex')
    const token = totp.generate(secret)

    totp.resetOptions()
    totp.options = { step: 30, window: 10 }
    assert.isTrue(totp.check(token, secret))

    const twoFactorToken = await TwoFactorTokenFactory.merge({
      userId: user.id,
      secret: secret,
      token: token,
    }).create()

    const isValid = totp.check(twoFactorToken.token, twoFactorToken.secret)
    assert.isTrue(isValid)

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'verify-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
      twoFactorToken: twoFactorToken.token,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success.status, 'two-factor-verified')
  })

  test('handleLogin with a fake 2FA token return invalid-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('2fa_required')
    }).create()
    const user = company.user

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'verify-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
      twoFactorToken: cuid(),
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'invalid-two-factor')
  })

  test('handleLogin with a day old 2FA token returns invalid-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('2fa_required')
    }).create()
    const user = company.user

    const epoch = DateTime.local().minus({ days: 1 }).toMillis()
    totp.options = { epoch: epoch, step: 30 }
    const secret = randomBytes(20).toString('hex')
    const token = totp.generate(secret)

    totp.resetOptions()
    totp.options = { step: 30, window: 10 }
    assert.isFalse(totp.check(token, secret))

    const twoFactorToken = await TwoFactorTokenFactory.merge({
      userId: user.id,
      secret: secret,
      token: token,
    }).create()

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'verify-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
      twoFactorToken: twoFactorToken.token,
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'invalid-two-factor')
  })

  test('handleLogin with a 6 minute old 2FA token returns invalid-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('2fa_required')
    }).create()
    const user = company.user

    const epoch = DateTime.local().minus({ minutes: 6 }).toMillis()
    totp.options = { epoch: epoch, step: 30 }
    const secret = randomBytes(20).toString('hex')
    const token = totp.generate(secret)

    totp.resetOptions()
    totp.options = { step: 30, window: 10 }
    assert.isFalse(totp.check(token, secret))

    const twoFactorToken = await TwoFactorTokenFactory.merge({
      userId: user.id,
      secret: secret,
      token: cuid(),
    }).create()

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'verify-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
      twoFactorToken: twoFactorToken.token,
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'invalid-two-factor')
  })

  test('handleLogin with a future 6 minute 2FA token returns invalid-two-factor', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (user) => {
      user.apply('2fa_required')
    }).create()
    const user = company.user

    const epoch = DateTime.local().plus({ minutes: 6 }).toMillis()
    totp.options = { epoch: epoch, step: 30 }
    const secret = randomBytes(20).toString('hex')
    const token = totp.generate(secret)

    totp.resetOptions()
    totp.options = { step: 30, window: 10 }
    assert.isFalse(totp.check(token, secret))

    const twoFactorToken = await TwoFactorTokenFactory.merge({
      userId: user.id,
      secret: secret,
      token: cuid(),
    }).create()

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'verify-two-factor',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
      twoFactorToken: twoFactorToken.token,
    } as LoginInput

    const { error } = await handleLogin(params)

    assert.equal(error, 'invalid-two-factor')
  })

  test('handleLogin updates last login date', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'fetch-login-data',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success.user.id, user.id)
    assert.isNotNull(success.user.last_login)
    assert.equal(success.role, 'account-admin')
  })

  test('handleLogin returns data for a case manager', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'fetch-login-data',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success.user.id, user.id)
    assert.equal(success.role, 'case-manager')
  })

  test('handleLogin fetch-login-data returns data for a client user', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const role = await RoleFactory.merge({ companyId: company.id, role: 'client-user' })
      .with('user')
      .create()

    const user = role.user

    const auth = new Auth()
    const loginProcessToken = await auth.makeLoginProcessToken(user.id)

    const params: LoginInput = {
      action: 'fetch-login-data',
      userId: user.id,
      companyId: company.id,
      loginProcessToken: loginProcessToken,
    } as LoginInput

    const { success } = await handleLogin(params)

    assert.equal(success.user.id, user.id)
    assert.equal(success.role, 'client-user')
  })
})
