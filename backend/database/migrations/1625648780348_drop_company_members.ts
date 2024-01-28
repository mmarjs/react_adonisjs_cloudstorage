import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropCompanyMembers extends BaseSchema {
  protected tableName = 'company_members'

  public async up() {
    this.schema.dropTable(this.tableName)
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('company_id').unsigned().notNullable().references('id').inTable('companies')
      table.timestamps(true)
    })
  }
}
