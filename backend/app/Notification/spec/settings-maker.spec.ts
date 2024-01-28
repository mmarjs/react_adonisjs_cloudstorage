import test from 'japa'
import Role from 'App/Models/Role'
import NotificationSetting from 'App/Models/NotificationSetting'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import { UserFactory, CompanyFactory } from 'Database/factories'

test.group('Notification Settings Maker', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('make makes account admin settings', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    const res = await maker.make()
    assert.isTrue(res)

    const settings = await NotificationSetting.byUser(user.id, company.id, ['id'])

    assert.lengthOf(settings, 14)
  })

  test('make makes case manager settings', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'case-manager')

    const maker = new SettingsMaker(user.id, company.id, 'case-manager')
    const res = await maker.make()
    assert.isTrue(res)

    const settings = await NotificationSetting.byUser(user.id, company.id, ['id'])

    assert.lengthOf(settings, 11)
  })

  test('make makes client user settings', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'client-user')

    const maker = new SettingsMaker(user.id, company.id, 'client-user')
    const res = await maker.make()
    assert.isTrue(res)

    const settings = await NotificationSetting.byUser(user.id, company.id, ['id'])

    assert.lengthOf(settings, 10)
  })

  test('make makes account admin settings when a role is passed', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')

    const maker = new SettingsMaker(user.id, company.id, 'account-owner')
    const res = await maker.make()
    assert.isTrue(res)

    const settings = await NotificationSetting.byUser(user.id, company.id, ['id'])

    assert.lengthOf(settings, 14)
  })
})
