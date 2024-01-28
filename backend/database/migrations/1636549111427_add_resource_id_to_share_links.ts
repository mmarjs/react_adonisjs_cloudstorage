import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddResourceIdToShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('resource_id').notNullable().defaultTo(0).after('resource')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('resource_id')
    })
  }
}
