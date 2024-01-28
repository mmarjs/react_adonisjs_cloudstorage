import cuid from 'cuid'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class UserChannel extends BaseCommand {
  public static commandName = 'backfill:user_channels'
  public static description = 'Backfill user channels 2021'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Role } = await import('App/Models/Role')
    const { default: User } = await import('App/Models/User')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const roles = await Role.query().distinct('user_id')
    const userIds = roles.map((r) => r.userId)
    const users = await User.query().whereIn('id', userIds)

    const confirm = await this.prompt.confirm(
      `Do you want to backfill ${userIds.length} user channels?`
    )

    if (!confirm) {
      this.logger.error('Aborting backfill')
      await this.exit()
    }

    const res = await Database.transaction(async (trx) => {
      for (let user of users) {
        user.useTransaction(trx)
        user.channel = cuid()
        await user.save()

        if (!user.$isPersisted) {
          await trx.rollback()
          return false
        }
      }

      return true
    })

    if (!res) {
      this.logger.error(`Failed to backfill all the users`)
    } else {
      this.logger.success(`Successfully backfilled ${users.length} user channels`)
    }
  }
}
