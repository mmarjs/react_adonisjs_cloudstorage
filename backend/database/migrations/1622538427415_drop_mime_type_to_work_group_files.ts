import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropMimeTypeToWorkGroupFiles extends BaseSchema {
  protected tableName = 'work_group_files'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('mime_type')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('mime_type').notNullable().defaultTo('application/octet-stream').after('size')
    })
  }
}
