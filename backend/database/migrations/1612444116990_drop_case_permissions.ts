import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropCasePermissions extends BaseSchema {
  protected tableName = 'case_permissions'

  public async up() {
    this.schema.dropTable(this.tableName)
  }

  public async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.timestamps(true)
    })
  }
}
