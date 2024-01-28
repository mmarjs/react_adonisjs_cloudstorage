import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateFileFieldsInEvidenceItems extends BaseSchema {
  protected tableName = 'evidence_items'

  public async up() {
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN size BIGINT;`)
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('hash')
      table.dropColumn('hash_type')
      table.string('sha1').after('size')
      table.string('md5').after('size')
    })
  }

  public async down() {
    this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN size INT;`)
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sha1')
      table.dropColumn('md5')
      table.string('hash')
      table.string('hash_type')
    })
  }
}
