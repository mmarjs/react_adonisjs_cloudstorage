import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class UserRole extends BaseCommand {
  public static commandName = 'backfill:roles'
  public static description = 'Backfill account owner roles for auth upgrade Nov 2021'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Company } = await import('App/Models/Company')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: Role } = await import('App/Models/Role')

    const records = await Company.query().select('id', 'user_id')

    const confirm = await this.prompt.confirm(`Do you want to backfil ${records.length} roles?`)

    if (!confirm) {
      this.logger.error('Aborting backfill')
      await this.exit()
    }

    const res = await Database.transaction(async (trx) => {
      for (let company of records) {
        const status = await Role.addRole(company.userId, company.id, 'account-owner')

        if (!status) {
          await trx.rollback()
          return false
        }
      }

      return true
    })

    if (!res) {
      this.logger.error(`Failed to backfill roles`)
    } else {
      this.logger.success(`Successfully backfilled ${records.length} roles`)
    }
  }
}
