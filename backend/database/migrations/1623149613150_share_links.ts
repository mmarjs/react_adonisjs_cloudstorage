import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('granted_by_id').unsigned().notNullable().references('id').inTable('users')
      table.string('link').unique()
      table.string('resource').notNullable()
      table.integer('resource_id').unsigned().notNullable()
      table.integer('parent_id').unsigned().nullable()
      table.string('subject')
      table.text('message')
      table.timestamps(true)
      table.timestamp('expires_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
