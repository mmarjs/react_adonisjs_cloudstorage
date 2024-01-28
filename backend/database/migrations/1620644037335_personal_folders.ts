import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PersonalFolders extends BaseSchema {
  protected tableName = 'personal_folders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('parent_id').unsigned().nullable().index('parent_id_index')
      table.string('name').notNullable().defaultTo('Untitled')
      table.string('access').defaultTo('private')
      table.string('status').notNullable()
      table.text('notes').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
