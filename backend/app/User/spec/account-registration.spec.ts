import test from 'japa'
import cuid from 'cuid'
import Chance from 'chance'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import AccountRegistration from 'App/User/AccountRegistration'
import { RegisterAccountOwnerInput } from 'App/types'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

const chance = Chance.Chance()

test.group('Account Registration', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('AccountRegistration creates user', async (assert) => {
    const input: RegisterAccountOwnerInput = {
      email: chance.email(),
      first_name: 'Joe',
      last_name: 'Soap',
      password: cuid(),
      account_name: chance.company(),
    }

    const account = new AccountRegistration(input)
    const { error, success } = await account.register()

    assert.isNull(error)
    assert.isTrue(success)
  })

  test('AccountRegistration returns duplicate-entry', async (assert) => {
    await UserFactory.merge({ email: 'foo@gmail.com' }).create()

    const input: RegisterAccountOwnerInput = {
      email: 'foo@gmail.com',
      first_name: 'Joe',
      last_name: 'Soap',
      password: cuid(),
      account_name: chance.company(),
    }

    const account = new AccountRegistration(input)
    const { error } = await account.register()

    assert.equal(error, 'duplicate-entry')
  })

  test('AccountRegistration adds role', async (assert) => {
    const input: RegisterAccountOwnerInput = {
      email: chance.email(),
      first_name: chance.first(),
      last_name: 'Soap',
      password: cuid(),
      account_name: chance.company(),
    }

    const account = new AccountRegistration(input)
    const { error, success } = await account.register()

    assert.isNull(error)
    assert.isTrue(success)

    const user = await User.query()
      .where('first_name', input.first_name)
      .where('last_name', input.last_name)
      .firstOrFail()
    const role = await Role.findByOrFail('user_id', user.id)

    assert.equal(user.firstName, input.first_name)
    assert.equal(role.role, 'account-owner')
  })
})
