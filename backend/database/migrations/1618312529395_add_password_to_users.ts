import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddPasswordToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('auth')
      table.string('salt').notNullable().after('email')
      table.string('password').notNullable().after('email')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('password')
      table.dropColumn('salt')
      table.string('auth').after('last_name')
    })
  }
}
