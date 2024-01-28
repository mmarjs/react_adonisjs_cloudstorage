import test from 'japa'
import { totp } from 'otplib'
import { randomBytes } from 'crypto'
import TwoFactorToken from 'App/Models/TwoFactorToken'
import Database from '@ioc:Adonis/Lucid/Database'
import { isTwoFactorRequired, isValidOtp } from 'App/Auth/TwoFactor'
import { UserFactory, CompanyFactory } from 'Database/factories'

test.group('Two Factor Lib', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('empty 2FA token returns false', async (assert) => {
    const res = await isValidOtp('')

    assert.isFalse(res)
  })

  test('valid 2FA token returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    const secret = randomBytes(20).toString('hex')
    totp.options = { step: 30 }
    const token = totp.generate(secret)

    const twoFactorToken = new TwoFactorToken()
    twoFactorToken.userId = user.id
    twoFactorToken.method = 'email'
    twoFactorToken.secret = secret
    twoFactorToken.token = token
    await twoFactorToken.save()

    const res = await isValidOtp(token)

    assert.isTrue(res)
  })

  test('Company with 2FA and User without return true', async (assert) => {
    const company = await CompanyFactory.apply('2fa_required').with('user').create()
    const user = await UserFactory.create()

    const isRequired = await isTwoFactorRequired(user.id, company.id)

    assert.isTrue(isRequired)
  })

  test('Company with no 2FA and User with 2FA return true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.apply('2fa_required').create()

    const isRequired = await isTwoFactorRequired(user.id, company.id)

    assert.isTrue(isRequired)
  })

  test('Company with 2FA and User with 2FA return true', async (assert) => {
    const company = await CompanyFactory.apply('2fa_required').with('user').create()
    const user = await UserFactory.apply('2fa_required').create()

    const isRequired = await isTwoFactorRequired(user.id, company.id)

    assert.isTrue(isRequired)
  })

  test('Company with no 2FA and User with no 2FA return false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    const isRequired = await isTwoFactorRequired(user.id, company.id)

    assert.isFalse(isRequired)
  })
})
