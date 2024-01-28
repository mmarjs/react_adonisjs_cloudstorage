import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddLastLoginDateToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('last_login').after('updated_at')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_login')
    })
  }
}
