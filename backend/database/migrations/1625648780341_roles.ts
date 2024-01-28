import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Roles extends BaseSchema {
  protected tableName = 'roles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.string('role')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.unique(['user_id', 'company_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
