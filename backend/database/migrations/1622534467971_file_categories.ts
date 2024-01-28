import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FileCategories extends BaseSchema {
  protected tableName = 'file_categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('category').notNullable().unique()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
