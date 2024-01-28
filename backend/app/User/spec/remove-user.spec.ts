import test from 'japa'
import Role from 'App/Models/Role'
import Event from 'App/Models/Event'
import RemoveUser from 'App/User/RemoveUser'
import PersonalFolder from 'App/Models/PersonalFolder'
import PersonalFile from 'App/Models/PersonalFile'
import Permission from 'App/Models/Permission'
import Preference from 'App/Models/Preference'
import Database from '@ioc:Adonis/Lucid/Database'
import SettingsMaker from 'App/Notification/SettingsMaker'
import PreferenceMaker from 'App/Preference/PreferenceMaker'
import PermissionMaker from 'App/Lib/PermissionMaker'
import NotificationSetting from 'App/Models/NotificationSetting'
import {
  CompanyFactory,
  UserFactory,
  PersonalFolderFactory,
  PersonalFileFactory,
} from 'Database/factories'

test.group('RemoveUser', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('remove removes all user company data', async (assert) => {
    const company = await CompanyFactory.with('user').create()
    const user = await UserFactory.create()

    await Role.addRole(user.id, company.id, 'account-admin')
    await PermissionMaker.make(user.id, company.id, 1, 'case', [
      'read',
      'write',
      'create',
      'trash',
      'grant',
    ])

    const settingsMaker = new SettingsMaker(user.id, company.id, 'account-admin')
    const areSettingsMade = await settingsMaker.make()
    assert.isTrue(areSettingsMade)

    const preferenceMaker = new PreferenceMaker(user.id, company.id)
    const arePrefenceMade = await preferenceMaker.make()
    assert.isTrue(arePrefenceMade)

    const personalFolder = await PersonalFolderFactory.merge({
      userId: user.id,
      companyId: company.id,
      parentId: 0,
    }).create()

    await PersonalFileFactory.merge({
      personalFolderId: personalFolder.id,
      fileTypeId: 1,
    }).createMany(3)

    const removeUser = new RemoveUser(user.id, company.id, {
      userId: company.user.id,
      companyId: company.id,
    })
    const { error, success } = await removeUser.remove()

    assert.isNull(error)
    assert.equal(success, 'successfully-removed-user')

    const settingsCount = await NotificationSetting.query()
      .count('id as total')
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(settingsCount.total, 0)

    const prefCount = await Preference.query()
      .count('id as total')
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(prefCount.total, 0)

    const permissionCount = await Permission.query()
      .count('id as total')
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(permissionCount.total, 0)

    const folderCount = await PersonalFolder.query()
      .count('id as total')
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(folderCount.total, 0)

    const fileCount = await PersonalFile.query()
      .count('id as total')
      .where({ personalFolderId: personalFolder.id })
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(fileCount.total, 0)

    const roleCount = await Role.query()
      .count('id as total')
      .where({ userId: user.id })
      .where({ companyId: company.id })
      .pojo<{ total: number }>()
      .firstOrFail()

    assert.equal(roleCount.total, 0)

    const event = await Event.query().where({ resourceId: user.id }).firstOrFail()

    assert.equal(event.name, 'user-removed-from-company')
    assert.equal(event.data?.email, user.email)
  })
})
