import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberStartCities extends BaseSchema {
  protected tableName = 'uber_start_cities'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('uber_trip_history_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('uber_trip_histories')
      table.float('latitude')
      table.string('display_name')
      table.float('longitude')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
