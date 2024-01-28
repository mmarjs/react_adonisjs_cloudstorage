import cuid from 'cuid'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class CompanyChannel extends BaseCommand {
  public static commandName = 'backfill:channels'
  public static description = 'Backfill company channels 2021'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Company } = await import('App/Models/Company')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const companies = await Company.query().select('id')

    const confirm = await this.prompt.confirm(
      `Do you want to backfill ${companies.length} channels?`
    )

    if (!confirm) {
      this.logger.error('Aborting backfill')
      await this.exit()
    }

    const res = await Database.transaction(async (trx) => {
      for (let company of companies) {
        company.useTransaction(trx)
        company.channel = cuid()
        await company.save()

        if (!company.$isPersisted) {
          await trx.rollback()
          return false
        }
      }

      return true
    })

    if (!res) {
      this.logger.error(`Failed to backfill all the companies`)
    } else {
      this.logger.success(`Successfully backfilled ${companies.length} company channels`)
    }
  }
}
