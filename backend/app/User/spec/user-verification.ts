import test from 'japa'
import cuid from 'cuid'
import { UserInvitationFactory, CompanyFactory, UserFactory } from 'Database/factories'
import { DateTime } from 'luxon'
import Role from 'App/Models/Role'
import Database from '@ioc:Adonis/Lucid/Database'
import UserVerification from 'App/User/UserVerification'

test.group('User Verification', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('null invitation returns invitation-does-not-exist', async (assert) => {
    const verification = new UserVerification(cuid(), cuid())
    const { error } = await verification.verify()

    assert.equal(error, 'invitation-does-not-exist')
  })

  test('expired invitation returns invitation-is-expired', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const invitation = await UserInvitationFactory.merge({
      userId: user.id,
      expiresAt: DateTime.local().minus({ months: 1 }),
    }).create()

    const verification = new UserVerification(invitation.code, cuid())
    const { error } = await verification.verify()

    assert.equal(error, 'invitation-is-expired')
  })

  test('already accepted invitation returns invitation-already-accepted', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const invitation = await UserInvitationFactory.merge({
      userId: user.id,
      status: 'accepted',
      expiresAt: DateTime.local().plus({ months: 1 }),
    }).create()

    const verification = new UserVerification(invitation.code, cuid())
    const { error } = await verification.verify()

    assert.equal(error, 'invitation-already-accepted')
  })

  test('valid invitation returns true', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.apply('invited').create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const invitation = await UserInvitationFactory.merge({
      userId: user.id,
      status: 'sent',
      expiresAt: DateTime.local().plus({ months: 1 }),
    }).create()

    const verification = new UserVerification(invitation.code, cuid())
    const { success } = await verification.verify()

    assert.isTrue(success)

    await invitation.refresh()
    assert.equal(invitation.status, 'accepted')

    await user.refresh()
    assert.equal(user.status, 'active')
    assert.equal(user.verified, true)
  })
})
