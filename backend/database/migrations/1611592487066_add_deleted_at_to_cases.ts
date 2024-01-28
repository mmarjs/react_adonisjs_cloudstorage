import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDeletedAtToCases extends BaseSchema {
  protected tableName = 'cases'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('deleted_at').nullable().after('updated_at')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('deleted_at')
    })
  }
}
