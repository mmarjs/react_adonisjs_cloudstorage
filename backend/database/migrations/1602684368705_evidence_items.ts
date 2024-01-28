import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class EvidenceItems extends BaseSchema {
  protected tableName = 'evidence_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('evidence_id').unsigned().notNullable().references('id').inTable('evidences')
      table.string('public_evidence_item_id').notNullable().unique()
      table.string('path').notNullable()
      table.integer('size').unsigned().notNullable()
      table.string('hash').notNullable()
      table.string('hash_type').notNullable()
      table.timestamp('date_collected').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
