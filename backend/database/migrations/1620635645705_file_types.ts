import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FileTypes extends BaseSchema {
  protected tableName = 'file_types'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable().index('file_type_name')
      table.string('extension').notNullable()
      table.string('alternate_extensions').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
