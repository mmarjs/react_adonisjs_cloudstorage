import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddResourceIdToEvents extends BaseSchema {
  protected tableName = 'events'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('resource_id').unsigned().nullable().after('company_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('resource_id')
    })
  }
}
