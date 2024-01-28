import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddMaxEmployeesToCompanies extends BaseSchema {
  protected tableName = 'companies'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('max_employees').defaultTo(3).after('is_two_factor_required')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('max_employees')
    })
  }
}
