import Role from 'App/Models/Role'
import User from 'App/Models/User'
import Permission from 'App/Models/Permission'
import Preference from 'App/Models/Preference'
import PersonalFolder from 'App/Models/PersonalFolder'
import PersonalFile from 'App/Models/PersonalFile'
import NotificationSetting from 'App/Models/NotificationSetting'
import Database from '@ioc:Adonis/Lucid/Database'
import { Either, SpecificUser } from 'App/types'
import EventDispatcher from 'App/Event/EventDispatcher'
import Logger from '@ioc:Adonis/Core/Logger'

export default class RemoveUser {
  public userId: number
  public companyId: number
  public actor: SpecificUser

  constructor(userId: number, companyId: number, actor: SpecificUser) {
    this.userId = userId
    this.companyId = companyId
    this.actor = actor
  }

  public async remove(): Promise<Either<string>> {
    Logger.info(`Removing user ${this.userId} from company ${this.companyId}`)

    const currentRole = await Role.currentRole(this.userId, this.companyId)
    const user = await User.query()
      .select('first_name', 'last_name', 'email')
      .where({ id: this.userId })
      .firstOrFail()

    const areSettingsRemoved = await this.removeSettings()

    if (!areSettingsRemoved) {
      return { error: 'failed-to-remove-notification-settings' }
    }

    const arePrefsRemoved = await this.removePreferences()

    if (!arePrefsRemoved) {
      return { error: 'failed-to-remove-preferences' }
    }

    const arePermissionsRemoved = await this.removePermissions()

    if (!arePermissionsRemoved) {
      return { error: 'failed-to-remove-permissions ' }
    }

    const isPersonalFolderRemoved = await this.removePersonalFolder()

    if (!isPersonalFolderRemoved) {
      return { error: 'failed-to-remove-personal-folder' }
    }

    const isRoleRemoved = await this.removeRole()

    if (!isRoleRemoved) {
      return { error: 'failed-to-remove-role' }
    }

    Logger.info('dispatching event')
    await EventDispatcher.dispatch({
      userId: this.actor.userId,
      companyId: this.actor.companyId,
      name: 'user-removed-from-company',
      resource: 'user',
      resourceId: this.userId,
      data: {
        role: currentRole,
        name: user.fullName,
        email: user.email,
      },
    })

    return { error: null, success: 'successfully-removed-user' }
  }

  private async removeSettings() {
    const settings = await NotificationSetting.query()
      .select('id')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ id: number }>()

    const settingIds = settings.map((s) => s.id)

    Logger.info(`Removing ${settingIds.length} notification settings`)

    await Database.transaction(async (trx) => {
      return await NotificationSetting.query({ client: trx })
        .whereIn('id', settingIds)
        .delete()
        .limit(settingIds.length)
    })

    const count = await NotificationSetting.query()
      .count('id as total')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ total: number }>()
      .first()

    Logger.info(`There are ${count?.total} settings left after removal`)

    return count?.total === 0
  }

  private async removePreferences() {
    const prefs = await Preference.query()
      .select('id')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ id: number }>()

    const prefIds = prefs.map((s) => s.id)
    Logger.info(`Removing ${prefIds.length} preferences`)

    await Database.transaction(async (trx) => {
      return await Preference.query({ client: trx })
        .whereIn('id', prefIds)
        .delete()
        .limit(prefIds.length)
    })

    const count = await Preference.query()
      .count('id as total')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ total: number }>()
      .first()

    Logger.info(`There are ${count?.total} settings left after removal`)
    return count?.total === 0
  }

  private async removePermissions() {
    const permissions = await Permission.query()
      .select('id')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ id: number }>()

    const permissionIds = permissions.map((s) => s.id)
    Logger.info(`Removing ${permissionIds.length} preferences`)

    await Database.transaction(async (trx) => {
      await Permission.query({ client: trx })
        .whereIn('id', permissionIds)
        .delete()
        .limit(permissionIds.length)
    })

    const count = await Permission.query()
      .count('id as total')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ total: number }>()
      .first()

    Logger.info(`There are ${count?.total} permissions left after removal`)
    return count?.total === 0
  }

  private async removeRole() {
    const role = await Role.query()
      .select('id')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .first()

    Logger.info(`Removing ${role?.role} role for role id ${role?.id}`)

    await Database.transaction(async (trx) => {
      role?.useTransaction(trx)
      await role?.delete()
    })

    const count = await Role.query()
      .count('id as total')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ total: number }>()
      .first()

    Logger.info(`There are ${count?.total} role left after removal`)
    return count?.total === 0
  }

  private async removePersonalFolder() {
    const folders = await PersonalFolder.query()
      .select('id')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ id: number }>()

    const folderIds = folders.map((f) => f.id)

    const files = await PersonalFile.query()
      .select('id')
      .whereIn('personal_folder_id', folderIds)
      .pojo<{ id: number }>()

    const fileIds = files.map((f) => f.id)

    Logger.info(
      `Removing ${folderIds.length} personal folders and ${fileIds.length}  files for user ${this.userId}`
    )

    await Database.transaction(async (trx) => {
      await PersonalFile.query({ client: trx })
        .whereIn('id', fileIds)
        .delete()
        .limit(fileIds.length)

      await PersonalFolder.query({ client: trx })
        .whereIn('id', folderIds)
        .delete()
        .limit(folderIds.length)
    })

    const folderCount = await PersonalFolder.query()
      .count('id as total')
      .where({ userId: this.userId })
      .where({ companyId: this.companyId })
      .pojo<{ total: number }>()
      .first()

    Logger.info(`There are ${folderCount?.total} personal folders left after removal`)
    return folderCount?.total === 0
  }
}
