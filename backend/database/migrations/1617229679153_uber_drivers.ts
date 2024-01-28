import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UberDrivers extends BaseSchema {
  protected tableName = 'uber_drivers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('uber_trip_history_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('uber_trip_histories')
      table.string('phone_number')
      table.string('sms_number')
      table.integer('rating')
      table.string('picture_url')
      table.string('name')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
