import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class UserPreferences extends BaseCommand {
  public static commandName = 'backfill:preferences'
  public static description = 'Backfill user prefrences'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Role } = await import('App/Models/Role')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: PreferenceMaker } = await import('App/Preference/PreferenceMaker')

    const roles = await Role.query().select('id', 'user_id', 'company_id')

    const confirm = await this.prompt.confirm(
      `Do you want to backfill ${roles.length} user preferences?`
    )

    if (!confirm) {
      this.logger.error('Aborting backfill')
      await this.exit()
    }

    const res = await Database.transaction(async (trx) => {
      for (let role of roles) {
        const maker = new PreferenceMaker(role.userId, role.companyId)
        const isMade = await maker.make(trx)

        if (!isMade) {
          await trx.rollback()
          return false
        }
      }

      return true
    })

    if (!res) {
      this.logger.error(`Failed to backfill all the user preferences`)
    } else {
      this.logger.success(`Successfully backfilled ${roles.length} user preferences`)
    }
  }
}
