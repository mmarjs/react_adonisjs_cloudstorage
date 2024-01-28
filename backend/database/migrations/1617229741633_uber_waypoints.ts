import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberWaypoints extends BaseSchema {
  protected tableName = 'uber_waypoints'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('uber_trip_history_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('uber_trip_histories')
      table.string('rider_id')
      table.float('latitude')
      table.string('type')
      table.float('longitude')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
