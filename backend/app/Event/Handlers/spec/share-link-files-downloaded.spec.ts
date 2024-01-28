import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import ShareLinkFilesDownloaded from 'App/Event/Handlers/ShareLinkFilesDownloaded'
import {
  CompanyFactory,
  UserFactory,
  CaseFactory,
  EventFactory,
  WorkGroupFolderFactory,
  ShareLinkFactory,
} from 'Database/factories'

test.group('Share Link Files Files Downloaded', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('handle handles correctly', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()
    await Role.addRole(user.id, company.id, 'account-admin')
    const maker = new SettingsMaker(user.id, company.id, 'account-admin')
    await maker.make()

    const caseInstance = await CaseFactory.merge({ companyId: company.id }).create()
    const folder = await WorkGroupFolderFactory.merge({
      caseId: caseInstance.id,
      ownerId: user.id,
    }).create()

    const shareLink = await ShareLinkFactory.merge({
      grantedById: company.user.id,
      companyId: company.id,
    }).create()

    await shareLink.load('grantedBy')

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'share-link-files-downloaded',
      data: {
        resource: 'workgroup',
        folderId: folder.id,
        numFiles: 10,
        shareLinkId: shareLink.id,
      },
    }).create()

    const res = await ShareLinkFilesDownloaded.handle(event)

    assert.isTrue(res)

    const notifications = await Notification.userNotifications(user.id, company.id, [
      'event_id',
      'message',
    ])
    assert.lengthOf(notifications, 1)
    assert.isTrue(notifications.some((n) => n.eventId === event.id))

    const message = notifications[0].message
    const actorName = `${user.firstName} ${user.lastName}`
    const grantorName = shareLink.grantedBy.fullName

    let text = `${actorName} downloaded 10 files from shared folder `
    text += `${folder?.name} in the ${caseInstance.caseName} case. `
    text += `The share link was granted by ${grantorName} on ${shareLink.createdAt.toISODate()}.`

    assert.equal(message, text)
  })
})
