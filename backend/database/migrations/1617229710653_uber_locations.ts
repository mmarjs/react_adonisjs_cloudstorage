import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberLocations extends BaseSchema {
  protected tableName = 'uber_locations'

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
      table.float('longitude')
      table.integer('bearing')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
