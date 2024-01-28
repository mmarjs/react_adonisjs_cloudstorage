import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AdjustFileTypes extends BaseSchema {
  protected tableName = 'file_types'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('file_category_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('file_categories')
        .after('id')
      table.string('mime').notNullable().defaultTo('application/octet-stream').after('name')
      table.dropColumn('extension')
      table.dropColumn('alternate_extensions')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('extension').notNullable()
      table.string('alternate_extensions').nullable()
    })
  }
}
