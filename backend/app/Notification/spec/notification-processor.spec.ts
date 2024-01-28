import test from 'japa'
import Role from 'App/Models/Role'
import Permission from 'App/Models/Permission'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import PermissionMaker from 'App/Lib/PermissionMaker'
import NotificationProcessor from 'App/Notification/NotificationProcessor'
import {
  CompanyFactory,
  UserFactory,
  CaseFactory,
  EventFactory,
  PermissionFactory,
  NotificationSettingFactory,
} from 'Database//factories'

test.group('Notification Processor', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('getAdmins excludes all users without who do not wish to be notified', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const accountOwner = company.user
    const accountAdmin = await UserFactory.create()

    await Role.addRole(accountOwner.id, company.id, 'account-owner')
    await Role.addRole(accountAdmin.id, company.id, 'account-admin')

    await NotificationSettingFactory.merge({
      userId: accountOwner.id,
      companyId: company.id,
      event: 'case-created',
      sendApp: false,
      sendEmail: true,
    }).create()

    await NotificationSettingFactory.merge({
      userId: accountAdmin.id,
      companyId: company.id,
      event: 'case-created',
    }).create()

    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const event = await EventFactory.merge({
      userId: accountAdmin.id,
      companyId: company.id,
      name: 'case-created',
      resourceId: c.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const admins = await processor.getAdmins()

    assert.deepEqual(
      admins.map((a) => a.user_id),
      [accountOwner.id, accountAdmin.id]
    )
  })

  test('getAdmins excludes all users are are not active', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const accountOwner = company.user
    const accountAdmin = await UserFactory.apply('invited').create()

    await Role.addRole(accountOwner.id, company.id, 'account-owner')
    await Role.addRole(accountAdmin.id, company.id, 'account-admin')

    await NotificationSettingFactory.merge({
      userId: accountOwner.id,
      companyId: company.id,
      event: 'case-created',
      sendApp: false,
      sendEmail: true,
    }).create()

    await NotificationSettingFactory.merge({
      userId: accountAdmin.id,
      companyId: company.id,
      event: 'case-created',
    }).create()

    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const event = await EventFactory.merge({
      userId: accountAdmin.id,
      companyId: company.id,
      name: 'case-created',
      resourceId: c.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const admins = await processor.getAdmins()

    assert.deepEqual(
      admins.map((a) => a.user_id),
      [accountOwner.id]
    )
  })

  test('getNonAdmins returns empty for admin only event', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const accountOwner = company.user
    await Role.addRole(accountOwner.id, company.id, 'account-owner')

    const accountAdmin = await UserFactory.create()
    await Role.addRole(accountAdmin.id, company.id, 'account-admin')

    const role = await Role.query()
      .where({ userId: accountAdmin.id })
      .where({ companyId: company.id })
      .firstOrFail()

    const event = await EventFactory.merge({
      userId: company.userId,
      companyId: company.id,
      name: 'user-added-to-company',
      resource: 'role',
      resourceId: role.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const res = await processor.getNonAdmins()

    assert.lengthOf(res, 0)
  })

  test('getNonAdmins returns only users with at least one setting', async (assert) => {
    const company = await CompanyFactory.with('user').create()

    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const caseManagerA = await UserFactory.create()
    await Role.addRole(caseManagerA.id, company.id, 'case-manager')
    await PermissionFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      resource: 'case',
      resourceId: c.id,
    }).create()

    await NotificationSettingFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: true,
      sendEmail: true,
    }).create()

    const caseManagerB = await UserFactory.create()
    await Role.addRole(caseManagerB.id, company.id, 'case-manager')
    await PermissionFactory.merge({
      userId: caseManagerB.id,
      companyId: company.id,
      resource: 'case',
      resourceId: c.id,
    }).create()
    await NotificationSettingFactory.merge({
      userId: caseManagerB.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: false,
      sendEmail: false,
    }).create()

    const event = await EventFactory.merge({
      userId: company.userId,
      companyId: company.id,
      name: 'user-added-to-case',
      resource: 'case',
      resourceId: c.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const res = await processor.getNonAdmins()

    assert.lengthOf(res, 1)
    assert.equal(res[0].user_id, caseManagerA.id)
    assert.equal(res[0].channel, caseManagerA.channel)
  })

  test('getNonAdmins returns only users with permissions', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const caseManagerA = await UserFactory.create()
    await Role.addRole(caseManagerA.id, company.id, 'case-manager')
    await PermissionFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      resource: 'case',
      resourceId: c.id,
    }).create()

    await NotificationSettingFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: true,
      sendEmail: true,
    }).create()

    const caseManagerB = await UserFactory.create()
    await Role.addRole(caseManagerB.id, company.id, 'case-manager')
    await NotificationSettingFactory.merge({
      userId: caseManagerB.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: true,
      sendEmail: false,
    }).create()

    const event = await EventFactory.merge({
      userId: company.userId,
      companyId: company.id,
      name: 'user-added-to-case',
      resource: 'case',
      resourceId: c.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const res = await processor.getNonAdmins()

    assert.lengthOf(res, 1)
    assert.equal(res[0].user_id, caseManagerA.id)
    assert.equal(res[0].channel, caseManagerA.channel)
  })

  test('getNonAdmins returns only active users', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const c = await CaseFactory.merge({ companyId: company.id }).create()

    const caseManagerA = await UserFactory.create()
    await Role.addRole(caseManagerA.id, company.id, 'case-manager')
    await PermissionFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      resource: 'case',
      resourceId: c.id,
    }).create()

    await NotificationSettingFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: true,
      sendEmail: true,
    }).create()

    const caseManagerB = await UserFactory.apply('invited').create()
    await Role.addRole(caseManagerB.id, company.id, 'case-manager')
    await PermissionFactory.merge({
      userId: caseManagerB.id,
      companyId: company.id,
      resource: 'case',
      resourceId: c.id,
    }).create()
    await NotificationSettingFactory.merge({
      userId: caseManagerB.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: true,
      sendEmail: false,
    }).create()

    const event = await EventFactory.merge({
      userId: company.userId,
      companyId: company.id,
      name: 'user-added-to-case',
      resource: 'case',
      resourceId: c.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const res = await processor.getNonAdmins()

    assert.lengthOf(res, 1)
    assert.equal(res[0].user_id, caseManagerA.id)
    assert.equal(res[0].channel, caseManagerA.channel)
  })

  test('process stores correct notifications', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const c = await CaseFactory.merge({ companyId: company.id }).create()
    const accountOwner = company.user
    const accountAdmin = await UserFactory.create()
    const caseManagerA = await UserFactory.create()
    const caseManagerB = await UserFactory.create()
    const clientUserA = await UserFactory.create()
    const clientUserB = await UserFactory.apply('invited').create()

    await Role.addRole(accountOwner.id, company.id, 'account-owner')
    await Role.addRole(accountAdmin.id, company.id, 'account-admin')
    await Role.addRole(caseManagerA.id, company.id, 'case-manager')
    await Role.addRole(caseManagerB.id, company.id, 'case-manager')
    await Role.addRole(clientUserA.id, company.id, 'client-user')
    await Role.addRole(clientUserB.id, company.id, 'client-user')

    await NotificationSettingFactory.merge({
      userId: accountOwner.id,
      companyId: company.id,
      event: 'user-added-to-case',
    }).create()

    await NotificationSettingFactory.merge({
      userId: accountAdmin.id,
      companyId: company.id,
      event: 'user-added-to-case',
      sendApp: false,
      sendEmail: false,
    }).create()

    await NotificationSettingFactory.merge({
      userId: caseManagerA.id,
      companyId: company.id,
      event: 'user-added-to-case',
    }).create()

    await NotificationSettingFactory.merge({
      userId: caseManagerB.id,
      companyId: company.id,
      event: 'user-added-to-case',
    }).create()

    await NotificationSettingFactory.merge({
      userId: clientUserA.id,
      companyId: company.id,
      event: 'user-added-to-case',
    }).create()

    await NotificationSettingFactory.merge({
      userId: clientUserB.id,
      companyId: company.id,
      event: 'user-added-to-case',
    }).create()

    await PermissionMaker.make(caseManagerA.id, company.id, c.id, 'case', Permission.actions)
    await PermissionMaker.make(clientUserA.id, company.id, c.id, 'case', ['read', 'write'])

    const event = await EventFactory.merge({
      userId: accountAdmin.id,
      companyId: company.id,
      name: 'user-added-to-case',
      resource: 'case',
      resourceId: c.id,
    }).create()

    const processor = new NotificationProcessor(event, 'foo bar baz')
    const res = await processor.process()

    assert.isTrue(res)

    const notifications = await Notification.query().where('company_id', company.id)

    assert.lengthOf(notifications, 3)
    assert.isTrue(notifications.some((n) => n.userId === accountOwner.id))
    assert.isTrue(notifications.some((n) => n.userId === caseManagerA.id))
    assert.isTrue(notifications.some((n) => n.userId === clientUserA.id))
  })
})
