import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ShareResources extends BaseSchema {
  protected tableName = 'share_resources'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('share_link_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('share_links')
      table.string('resource').notNullable()
      table.integer('resource_id').unsigned().notNullable()
      table.integer('parent_id').unsigned().nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
