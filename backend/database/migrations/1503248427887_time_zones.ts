import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TimeZones extends BaseSchema {
  protected tableName = 'time_zones'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('local').notNullable()
      table.integer('utc').notNullable().unique()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
