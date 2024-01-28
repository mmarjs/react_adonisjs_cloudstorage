import cuid from 'cuid'
import { DateTime } from 'luxon'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class RemoveUser extends BaseCommand {
  public static commandName = 'user:remove'

  public static description = 'Remove User Non Account Owners'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: User } = await import('App/Models/User')
    const { default: Company } = await import('App/Models/Company')
    const { default: Role } = await import('App/Models/Role')
    const { default: Permission } = await import('App/Models/Permission')
    const { default: Preference } = await import('App/Models/Preference')
    const { default: NotificationSetting } = await import('App/Models/NotificationSetting')
    const { default: Notification } = await import('App/Models/Notification')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const email = await this.prompt.ask('The User Email')
    const companyId = Number(await this.prompt.ask('The company id'))

    const user = await User.findByOrFail('email', email)
    const company = await Company.findOrFail(companyId)
    const userId = user.id
    const role = await Role.query().where({ userId }).where({ companyId }).first()

    if (role === null) {
      this.logger.error(`Invalid user`)
      await this.exit()
    }

    const permissions = await Permission.query().where({ userId }).where({ companyId })
    const preferences = await Preference.query().where({ userId }).where({ companyId })
    const setttings = await NotificationSetting.query().where({ userId }).where({ companyId })
    const notifications = await Notification.query().where({ userId }).where({ companyId })

    const choice = await this.prompt.confirm(
      `Are you sure you want to fully remove ${user?.fullName} at ${company.name}.
      \n This means removing 1 role, ${permissions.length} permissions, ${preferences.length} preferences, ${setttings.length} settings, and ${notifications.length} notifications.`
    )

    if (!choice) {
      this.logger.error('Aborting password reset')
      await this.exit()
    }

    const res = await Database.transaction(async (trx) => {
      role?.useTransaction(trx)
      await role?.delete()

      if (!role?.$isDeleted) {
        await trx.rollback()
        return false
      }

      this.logger.debug(`Removed role`)

      const permsDeleted = await Permission.query()
        .where({ userId })
        .where({ companyId })
        .delete()
        .limit(permissions.length)

      if (permissions.length > 0 && permsDeleted[0] === 0) {
        await trx.rollback()
        return false
      }

      this.logger.debug(`Removed permissions`)

      const prefsDeleted = await Preference.query()
        .where({ userId })
        .where({ companyId })
        .delete()
        .limit(preferences.length)

      if (preferences.length > 0 && prefsDeleted[0] === 0) {
        await trx.rollback()
        return false
      }

      this.logger.debug(`Removed preferences`)

      const settingsDeleted = await NotificationSetting.query()
        .where({ userId })
        .where({ companyId })
        .delete()
        .limit(setttings.length)

      if (setttings.length > 0 && settingsDeleted[0] === 0) {
        await trx.rollback()
        return false
      }

      this.logger.debug(`Removed notification settings`)

      const notificationsDeleted = await Notification.query()
        .where({ userId })
        .where({ companyId })
        .delete()
        .limit(notifications.length)

      if (notifications.length > 0 && notificationsDeleted[0] === 0) {
        await trx.rollback()
        return false
      }

      this.logger.debug(`Removed notifications`)

      return true
    })

    if (!res) {
      this.logger.error(`Failed to delete user data`)
    }

    const userUpdated = await Database.transaction(async (trx) => {
      user.useTransaction(trx)
      user.email = `${cuid()}@deleted.evidencelocker.com`
      user.salt = cuid()
      user.password = cuid()
      user.status = 'deleted'
      user.firstName = 'Deleted'
      user.lastName = 'User'
      user.phone = null
      user.street = null
      user.city = null
      user.state = null
      user.zip = 0
      user.companyName = ''
      user.verificationToken = null
      user.deletedAt = DateTime.local()
      await user.save()

      return user.$isPersisted
    })

    if (!userUpdated) {
      this.logger.error(`Failed to scrub user data`)
    }

    this.logger.success(`Successfully removed user`)
  }
}
