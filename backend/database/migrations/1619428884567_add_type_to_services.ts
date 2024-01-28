import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddTypeToServices extends BaseSchema {
  protected tableName = 'services'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('type').notNullable().after('filterable')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type')
    })
  }
}
