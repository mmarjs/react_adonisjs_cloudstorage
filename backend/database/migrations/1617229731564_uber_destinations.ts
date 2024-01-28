import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberDestinations extends BaseSchema {
  protected tableName = 'uber_destinations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('uber_trip_history_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('uber_trip_histories')
      table.string('alias')
      table.float('latitude')
      table.float('longitude')
      table.string('name')
      table.string('address')
      table.integer('eta')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
