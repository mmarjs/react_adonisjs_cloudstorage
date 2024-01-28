import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Enterprises extends BaseSchema {
  protected tableName = 'enterprises'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.string('subdomain').unique()
      table.string('database').unique()
      table.enu('billing_status', ['unactivated', 'active', 'suspended', 'deleted'])
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
