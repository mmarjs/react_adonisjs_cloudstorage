import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddIsTwoFactorRequiredToCompanies extends BaseSchema {
  protected tableName = 'companies'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_two_factor_required').defaultTo(false).after('billing_status')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_two_factor_required')
    })
  }
}
