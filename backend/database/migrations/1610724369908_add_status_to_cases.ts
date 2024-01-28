import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddStatusToCases extends BaseSchema {
  protected tableName = 'cases'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enu('status', ['active', 'archived']).notNullable().defaultTo('active').after('notes')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
    })
  }
}
