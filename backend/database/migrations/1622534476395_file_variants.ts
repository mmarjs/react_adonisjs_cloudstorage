import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FileVariants extends BaseSchema {
  protected tableName = 'file_variants'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('file_type_id').unsigned().notNullable().references('id').inTable('file_types')
      table.string('ext').notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
