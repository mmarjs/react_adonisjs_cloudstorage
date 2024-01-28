import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DropRoleFromUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role').after('last_name')
    })
  }
}
