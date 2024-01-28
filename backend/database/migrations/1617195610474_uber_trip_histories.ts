import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberTripHistories extends BaseSchema {
  protected tableName = 'uber_trip_histories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('acquisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('acquisitions')
      table.string('status')
      table.float('distance')
      table.integer('start_time').unsigned()
      table.integer('end_time').unsigned()
      table.integer('request_time').unsigned()
      table.string('product_id')
      table.string('request_id')
      table.float('surge_multiplier')
      table.boolean('shared')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
