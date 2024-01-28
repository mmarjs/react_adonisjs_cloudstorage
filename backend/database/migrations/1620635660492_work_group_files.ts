import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class WorkGroupFiles extends BaseSchema {
  protected tableName = 'work_group_files'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('work_group_folder_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('work_group_folders')
      table.integer('file_type_id').unsigned().notNullable().references('id').inTable('file_types')
      table.integer('owner_id').unsigned().notNullable().references('id').inTable('users')
      table.string('name').notNullable().defaultTo('Untitled').comment('human readable name')
      table.string('path').notNullable()
      table.bigInteger('size').unsigned().notNullable()
      table.string('access').defaultTo('private')
      table.string('status').notNullable()
      table.string('owner_name').notNullable()
      table.text('notes').nullable()
      table.timestamp('date_created')
      table.timestamp('last_modified')
      table.timestamp('last_accessed')
      table
        .integer('last_accessed_by_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
