import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MoveUserInfoToShareLinks extends BaseSchema {
  protected tableName = 'share_links'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('user_id')
      table.dropColumn('user_id')
      table.timestamp('last_login').after('share_type')
      table.string('company_name').after('link')
      table.string('phone').after('link')
      table.string('first_name').after('link')
      table.string('last_name').after('link')
      table.string('salt').notNullable().after('link')
      table.string('password').notNullable().after('link')
      table.string('email').notNullable().after('link')

      table.index('email')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users')

      table.dropColumn('company_name')
      table.dropColumn('phone')
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('salt')
      table.dropColumn('password')
      table.dropColumn('email')
    })
  }
}
