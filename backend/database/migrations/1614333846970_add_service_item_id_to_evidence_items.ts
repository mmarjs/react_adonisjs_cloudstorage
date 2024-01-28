import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddServiceItemIdToEvidenceItems extends BaseSchema {
  protected tableName = 'evidence_items'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table
        .integer('service_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('service_items')
        .after('evidence_id')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign(['service_item_id'])
    })
  }
}
