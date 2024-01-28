import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Custodians extends BaseSchema {
  protected tableName = 'custodians'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.string('email').notNullable()
      table.string('name')
      table.string('phone')
      table.string('alias')
      table.text('notes')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
