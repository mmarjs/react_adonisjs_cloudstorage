import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import ShareLinkClicked from 'App/Event/Handlers/ShareLinkClicked'
import {
  CompanyFactory,
  UserFactory,
  CaseFactory,
  EventFactory,
  WorkGroupFolderFactory,
  ShareLinkFactory,
} from 'Database/factories'

test.group('ShareLinkClicked', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle with workgroup upload share link creates a notification', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')
    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: company.user.id,
    }).create()

    await folder.load('case')

    const shareLink = await ShareLinkFactory.merge({
      grantedById: company.user.id,
      companyId: company.id,
      resource: 'work_group',
      resourceId: caseInstance.id,
      folderId: folder.id,
      shareType: 'upload',
    }).create()

    await shareLink.load('grantedBy')

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resource: 'case',
      resourceId: caseInstance.id,
      name: 'share-link-clicked',
      data: {
        shareLinkId: shareLink.id,
      },
    }).create()

    const res = await ShareLinkClicked.handle(event)
    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 1)
    assert.isTrue(notifications.some((n) => n.eventId === event.id))

    const notificationMessage = notifications[0].message

    let message = `The share upload link granted by ${shareLink.grantedBy.fullName} and sent to `
    message += `${shareLink.email}, has been accessed. This link allows the user to ${shareLink.shareType} files `
    message += `to the ${folder.name} folder in the ${folder.case.caseName} case.`

    assert.equal(notificationMessage, message)
  })

  test('handle with workgroup download share link creates a notification', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')
    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: company.user.id,
    }).create()

    await folder.load('case')

    const shareLink = await ShareLinkFactory.merge({
      grantedById: company.user.id,
      companyId: company.id,
      resource: 'work_group',
      resourceId: caseInstance.id,
      folderId: folder.id,
      shareType: 'download',
    }).create()

    await shareLink.load('grantedBy')

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resource: 'case',
      resourceId: caseInstance.id,
      name: 'share-link-clicked',
      data: {
        shareLinkId: shareLink.id,
      },
    }).create()

    const res = await ShareLinkClicked.handle(event)
    assert.isTrue(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 1)
    assert.isTrue(notifications.some((n) => n.eventId === event.id))

    const notificationMessage = notifications[0].message

    let message = `The share download link granted by ${shareLink.grantedBy.fullName} and sent to `
    message += `${shareLink.email}, has been accessed. This link allows the user to ${shareLink.shareType} files `
    message += `from the ${folder.name} folder in the ${folder.case.caseName} case.`

    assert.equal(notificationMessage, message)
  })

  test('handle with personal upload returns false', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')
    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: company.user.id,
    }).create()

    await folder.load('case')

    const shareLink = await ShareLinkFactory.merge({
      grantedById: company.user.id,
      companyId: company.id,
      resource: 'personal',
      resourceId: caseInstance.id,
      folderId: folder.id,
      shareType: 'upload',
    }).create()

    await shareLink.load('grantedBy')

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resource: 'case',
      resourceId: caseInstance.id,
      name: 'share-link-clicked',
      data: {
        shareLinkId: shareLink.id,
      },
    }).create()

    const res = await ShareLinkClicked.handle(event)
    assert.isFalse(res)

    const notifications = await Notification.query().where({ eventId: event.id })
    assert.lengthOf(notifications, 0)
  })
})
