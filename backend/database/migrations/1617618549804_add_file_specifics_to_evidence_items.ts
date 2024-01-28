import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddFileSpecificsToEvidenceItems extends BaseSchema {
  protected tableName = 'evidence_items'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('public_evidence_item_id', 'nonce')
      table.string('file_ending').after('public_evidence_item_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('nonce', 'public_evidence_item_id')
      table.dropColumn('file_ending')
    })
  }
}
