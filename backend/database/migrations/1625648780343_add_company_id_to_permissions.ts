import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCompanyIdToPermissions extends BaseSchema {
  protected tableName = 'permissions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('company_id')
        .unsigned()
        .notNullable()
        .defaultTo(1)
        .references('id')
        .inTable('companies')
        .after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('company_id')
      table.dropColumn('company_id')
    })
  }
}
