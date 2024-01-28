import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Events extends BaseSchema {
  protected tableName = 'events'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.string('name').notNullable()
      table.jsonb('data').nullable()
      table.timestamp('created_at', { useTz: true })
      table.index(['name'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
