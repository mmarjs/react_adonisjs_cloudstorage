import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Companies extends BaseSchema {
  protected tableName = 'companies'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.string('name').nullable()
      table.boolean('is_enterprise').notNullable().defaultTo(false)
      table.boolean('is_enterprise_subscriber').notNullable().defaultTo(false)
      table.enu('billing_status', ['unactivated', 'active', 'suspended', 'deleted'])
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
