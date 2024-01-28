import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCompanyNameToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('company_name').nullable().after('zip')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('company_name')
    })
  }
}
