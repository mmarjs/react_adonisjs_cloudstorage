import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServiceItemsSchema extends BaseSchema {
  protected tableName = 'service_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('service_id').unsigned().notNullable().references('id').inTable('services')
      table.string('name').notNullable()
      table.string('description').notNullable()
      table.boolean('active').notNullable().defaultTo(false)
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
