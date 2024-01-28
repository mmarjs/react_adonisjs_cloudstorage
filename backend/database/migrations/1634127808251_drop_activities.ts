import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropActivities extends BaseSchema {
  protected tableName = 'activities'

  public async up() {
    this.schema.dropTable(this.tableName)
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.string('company_extra').nullable()
      table.string('event').notNullable()
      table.string('subject').nullable()
      table.timestamps(true)
    })
  }
}
