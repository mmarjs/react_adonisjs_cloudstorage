import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AcquisitionRecords extends BaseSchema {
  protected tableName = 'acquisition_records'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('evidence_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('evidence_items')
      table.integer('record_id').unsigned().notNullable()
      table.string('record_table').notNullable()
      table.string('record_column').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
