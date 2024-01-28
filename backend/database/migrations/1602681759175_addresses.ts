import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Addresses extends BaseSchema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('addressable_id').unsigned().notNullable()
      table.string('addressable_type').notNullable()
      table.string('street_address')
      table.string('city_address')
      table.integer('state_id').unsigned().references('id').inTable('states')
      table.string('home_phone').nullable()
      table.string('mobile_phone').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
