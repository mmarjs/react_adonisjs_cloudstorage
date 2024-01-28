import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CasePermissions extends BaseSchema {
  protected tableName = 'case_permissions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
      table.integer('case_id').unsigned().notNullable().references('id').inTable('cases')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
