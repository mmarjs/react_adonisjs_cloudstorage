import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FileAudits extends BaseSchema {
  protected tableName = 'file_audits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('resource_id').unsigned().notNullable()
      table.string('resource').notNullable()
      table.string('action').notNullable()
      table.timestamp('created_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
