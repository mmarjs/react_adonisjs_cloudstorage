import test from 'japa'
import cuid from 'cuid'
import { CompanyFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'
import AccountOwnerVerification from 'App/User/AccountOwnerVerification'

test.group('AccountOwnerVerification', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('null user returns no-such-user', async (assert) => {
    const verification = new AccountOwnerVerification(cuid())
    const { error } = await verification.verify()

    assert.equal(error, 'no-such-user')
  })

  test('already verified user returns invitation returns already-verified', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (u) =>
      u.merge({ verified: true, status: 'invited' })
    ).create()

    const user = company.user

    const verification = new AccountOwnerVerification(user.verificationToken as string)
    const { error } = await verification.verify()

    assert.equal(error, 'already-verified')
  })

  test('already active user returns invitation returns already-active', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (u) =>
      u.merge({ verified: false, status: 'active' })
    ).create()

    const user = company.user

    const verification = new AccountOwnerVerification(user.verificationToken as string)
    const { error } = await verification.verify()

    assert.equal(error, 'already-active')
  })

  test('unverified user returns true and is verified', async (assert) => {
    const company = await CompanyFactory.with('user', 1, (u) =>
      u.merge({ verified: false, status: 'invited' })
    ).create()

    const user = company.user

    const verification = new AccountOwnerVerification(user.verificationToken as string)
    const { success } = await verification.verify()

    assert.isTrue(success)
  })
})
