import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class HandlingErrors extends BaseSchema {
  protected tableName = 'handling_errors'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().nullable().references('id').inTable('users')
      table.integer('company_id').unsigned().nullable().references('id').inTable('companies')
      table.string('event').notNullable()
      table.json('data').nullable()
      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
