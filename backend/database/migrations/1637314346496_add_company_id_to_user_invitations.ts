import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCompanyIdToUserInvitations extends BaseSchema {
  protected tableName = 'user_invitations'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('company_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('companies')
        .after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('company_id')
      table.dropColumn('company_id')
    })
  }
}
