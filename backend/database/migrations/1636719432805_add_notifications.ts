import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddNotifications extends BaseSchema {
  protected tableName = 'notifications'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.string('event').notNullable()
      table.string('message').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('dismissed_at', { useTz: true }).nullable()
      table.index(['event'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
