import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddStatusToEvidenceItems extends BaseSchema {
  protected tableName = 'evidence_items'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status').after('service_item_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
    })
  }
}
