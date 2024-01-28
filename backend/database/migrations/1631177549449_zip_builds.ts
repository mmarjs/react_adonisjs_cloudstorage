import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ZipBuilds extends BaseSchema {
  protected tableName = 'zip_builds'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.string('link').unique()
      table.json('input')
      table.json('output')
      table.string('downloaded_by').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('downloaded_at').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
