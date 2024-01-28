import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberRiders extends BaseSchema {
  protected tableName = 'uber_riders'

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
      table.string('first_name')
      table.boolean('me')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
