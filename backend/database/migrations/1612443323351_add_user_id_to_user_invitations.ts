import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddUserIdToUserInvitations extends BaseSchema {
  protected tableName = 'user_invitations'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .after('id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email').notNullable()
      table.dropForeign(['user_id'], 'user_invitations_user_id_foreign')
    })
  }
}
