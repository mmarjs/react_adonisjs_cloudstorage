import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddResourceToEvents extends BaseSchema {
  protected tableName = 'events'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('resource').after('company_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('resource')
    })
  }
}
