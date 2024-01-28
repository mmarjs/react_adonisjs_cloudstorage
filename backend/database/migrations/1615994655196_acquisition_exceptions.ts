import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AcquisitionExceptions extends BaseSchema {
  protected tableName = 'acquisition_exceptions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
      table.string('type')
      table.text('description')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
