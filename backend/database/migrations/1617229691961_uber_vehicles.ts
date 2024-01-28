import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberVehicles extends BaseSchema {
  protected tableName = 'uber_vehicles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('uber_trip_history_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('uber_trip_histories')
      table.string('make')
      table.string('model')
      table.string('license_plate')
      table.string('picture_url')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
