import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PersonalFiles extends BaseSchema {
  protected tableName = 'personal_files'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('personal_folder_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('personal_folders')
      table.integer('file_type_id').unsigned().notNullable().references('id').inTable('file_types')
      table.string('name').notNullable().defaultTo('Untitled').comment('human readable name')
      table.string('path').notNullable()
      table.bigInteger('size').unsigned().notNullable()
      table.string('access').defaultTo('private')
      table.string('status').notNullable()
      table.text('notes').nullable()
      table.timestamp('date_created')
      table.timestamp('last_modified')
      table.timestamp('last_accessed')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
