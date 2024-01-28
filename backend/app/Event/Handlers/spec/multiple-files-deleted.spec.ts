import test from 'japa'
import Role from 'App/Models/Role'
import Notification from 'App/Models/Notification'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import MultipleFilesDeleted from 'App/Event/Handlers/MultipleFilesDeleted'
import {
  CompanyFactory,
  UserFactory,
  CaseFactory,
  EventFactory,
  WorkGroupFolderFactory,
} from 'Database/factories'

test.group('Multiple Files Deleted', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test.skip('handle handles correctly', async (assert) => {
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

    await folder.load('case')
    const folderName = folder.name
    const caseName = folder.case.caseName

    const event = await EventFactory.merge({
      userId: user.id,
      companyId: company.id,
      resourceId: caseInstance.id,
      name: 'multiple-files-deleted',
      data: {
        resource: 'workgroup',
        numFiles: 10,
        folderName,
        caseName,
      },
    }).create()

    const res = await MultipleFilesDeleted.handle(event)

    assert.isTrue(res)

    const notifications = await Notification.userNotifications(user.id, company.id, [
      'event_id',
      'message',
    ])

    assert.lengthOf(notifications, 1)

    assert.isTrue(notifications.some((n) => n.eventId === event.id))
    assert.equal(
      notifications[0].message,
      `${user.firstName} ${user.lastName} deleted 10 files in the ${folder?.name} folder in the ${caseInstance.caseName} case.`
    )
  })
})
