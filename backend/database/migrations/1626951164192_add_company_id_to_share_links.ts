import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCompanyIdToShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('company_id')
        .unsigned()
        .notNullable()
        .defaultTo(1)
        .references('id')
        .inTable('companies')
        .after('id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('company_id')
    })
  }
}
