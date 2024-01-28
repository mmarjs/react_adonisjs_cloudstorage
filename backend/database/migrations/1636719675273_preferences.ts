import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Preferences extends BaseSchema {
  protected tableName = 'preferences'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.string('name')
      table.boolean('option')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.index(['name'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
