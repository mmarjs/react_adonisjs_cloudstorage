import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class MaxEmployees extends BaseCommand {
  public static commandName = 'backfill:max_employees'
  public static description = 'Backfill Max Employees for Auth Upgrade Nov 2021'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Company } = await import('App/Models/Company')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')

    const companies = await Company.query()
      .select('id')
      .whereNull('deleted_at')
      .pojo<{ id: number }>()

    const companyIds = companies.map((c) => c.id)

    const confirm = await this.prompt.confirm(
      `Do you want to update ${companyIds.length} companies`
    )

    if (!confirm) {
      this.logger.error('Aborting backfill')
      await this.exit()
    }

    const res = await Database.transaction(async (trx) => {
      const values = await Company.query({ client: trx })
        .whereIn('id', companyIds)
        .update({ maxEmployees: 10 })
        .limit(companyIds.length)

      return values[0] > 0
    })

    if (!res) {
      this.logger.error('Failed to backfill max employees')
      await this.exit()
    }

    this.logger.success(`Successfully backfilled max employes for ${companyIds.length} companies.`)
  }
}
