import test from 'japa'
import cuid from 'cuid'
import { CompanyFactory, PasswordResetFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'
import resetPassword from 'App/Auth/ResetPassword'

test.group('Invite User Pipeline', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('pipeline returns ok', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = company.user

    let reset = await PasswordResetFactory.merge({ userId: user.id }).create()
    const newPass = cuid()

    const { error, success } = await resetPassword({
      password: newPass,
      password_confirmation: newPass,
      token: reset.token,
    })

    assert.isNull(error)
    assert.equal(success, 'ok')
  })
})
