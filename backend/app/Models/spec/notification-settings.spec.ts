import test from 'japa'
import Database from '@ioc:Adonis/Lucid/Database'
import NotificationSetting from 'App/Models/NotificationSetting'
import { CompanyFactory, UserFactory, NotificationSettingFactory } from 'Database/factories'

test.group('NotificationSetting Model', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('byName returns correct notification setting', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await NotificationSettingFactory.merge({
      userId: user.id,
      companyId: company.id,
      event: 'case-archived',
    }).create()

    await NotificationSettingFactory.merge({
      userId: user.id,
      companyId: company.id,
      event: 'case-created',
    }).create()

    await NotificationSettingFactory.merge({
      userId: user.id,
      companyId: company.id,
      event: 'multiple-files-deleted',
    }).create()

    const res = await NotificationSetting.byName(user.id, company.id, 'case-archived')
    assert.isNotNull(res)
    assert.equal(res?.event, 'case-archived')
  })

  test('byUser returns all events', async (assert) => {
    const company = await CompanyFactory.with('user', 1).create()
    const user = await UserFactory.create()

    await NotificationSettingFactory.merge({
      userId: user.id,
      companyId: company.id,
      event: 'case-archived',
    }).create()

    await NotificationSettingFactory.merge({
      userId: user.id,
      companyId: company.id,
      event: 'case-created',
    }).create()

    await NotificationSettingFactory.merge({
      userId: user.id,
      companyId: company.id,
      event: 'multiple-files-deleted',
    }).create()

    const res = await NotificationSetting.byUser(user.id, company.id, ['id'])
    assert.lengthOf(res, 3)
  })
})
