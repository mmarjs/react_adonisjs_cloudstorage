import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import FilesUploaded from 'App/Event/Handlers/FilesUploaded'
import {
  CompanyFactory,
  UserFactory,
  CaseFactory,
  EventFactory,
  WorkGroupFolderFactory,
} from 'Database/factories'

test.group('Files Uploaded', (group) => {
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

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: folder.id,
      name: 'files-uploaded',
      data: {
        resource: 'workgroup',
        folderId: folder.id,
        numFiles: 10,
      },
    }).create()

    const res = await FilesUploaded.handle(event)

    assert.isTrue(res)

    const notifications = await Notification.userNotifications(user.id, company.id, [
      'event_id',
      'message',
    ])

    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${user.firstName} ${user.lastName} uploaded 10 files to the ${folder?.name} folder in the ${caseInstance.caseName} case.`
    )
  })
})
