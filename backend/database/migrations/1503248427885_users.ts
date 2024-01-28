import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid').notNullable().unique()
      table.string('email').notNullable().unique()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('auth').notNullable().unique()
      table.enu('role', [
        'super-admin',
        'account-owner',
        'account-admin',
        'case-manager',
        'evidence-user',
      ])
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
