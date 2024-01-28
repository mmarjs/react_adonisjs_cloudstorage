import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AcquisitionTasks extends BaseSchema {
  protected tableName = 'acquisition_tasks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
      table
        .integer('service_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('service_items')
      table.string('service_name')
      table.string('description')
      table.string('status')
      table.timestamps(true)
      table.timestamp('finished_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
